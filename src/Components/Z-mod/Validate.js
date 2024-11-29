import React, { useState, useEffect, useRef } from "react";
import { Divider, Table, Breadcrumb, Button, Popover, Input, Form, Modal, Select, Spin, notification, message } from "antd";
import { HomeOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "axios";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { CloudOutlined } from "@ant-design/icons";
import { Row, Col } from 'antd';
import ProgressModal from './ProgressModal';
import DeploymentProgressBar from './DeploymentProgressBar'
import { useLocation, useNavigate } from "react-router-dom";
import requirementData from "../../Comparison/min_requirements.json";
import dayjs from 'dayjs';
// import Report from './Report';

const getCloudNameFromMetadata = () => {
  let cloudNameMeta = document.querySelector('meta[name="cloud-name"]');
  return cloudNameMeta ? cloudNameMeta.content : null; // Return the content of the meta tag
};

const Validation = ({ nodes, onIbnUpdate, next }) => {
  const cloudName = getCloudNameFromMetadata();
  const [validationResults, setValidationResults] = useState({});
  //   const combinedDataSource = [...nodes];
  const [popoverVisible, setPopoverVisible] = useState({});
  const [isRevalidate, setIsRevalidate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState(null); // To store the fetched URLs
  const [notificationShown, setNotificationShown] = useState(false);
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);
  const [openOSModal, setOpenOSModal] = useState(false);
  const progressRequestControllerRef = useRef(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bmcDetails, setBmcDetails] = useState({
    ip: "",
    username: "",
    password: "",
  });
  const MySwal = withReactContent(Swal);
  const [progressVisible, setProgressVisible] = useState(false);
  const [validatingNode, setValidatingNode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIp, setSelectedIp] = useState(null);
  const [validated, setValidated] = useState(false);
  const [bmcFormVisible, setBmcFormVisible] = useState(false);
  const [currentNode, setCurrentNode] = useState(null);
  const [scanResults, setScanResults] = useState([]);
  const [targetServerIp, setTargetServerIp] = useState(null);
  const [canceltargetServerIp, setcancelTargetServerIp] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [isDeploymentStarted, setIsDeploymentStarted] = useState(false);
  const [ibn, setIbn] = useState('');
  const [disks, setDisks] = useState([]);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [openos, setOpenos] = useState(false);
  const [interfaces, setInterfaces] = useState([]);
  const result = validationResults[nodes.ip]; // Get results based on the IP
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isProgressModalVisible, setProgressModalVisible] = useState(false);
  const [filesProcessed, setFilesProcessed] = useState([]);
  const logContainerRef = useRef(null); // Reference for the log container to manage scrolling
  const [deploymentDetails, setDeploymentDetails] = useState(null);
  const [Ip, setIp] = useState({});
  const loginDetails = JSON.parse(localStorage.getItem('loginDetails'));
  const userId = loginDetails ? loginDetails.data.id : null;
  const [fetchedUrls, setFetchedUrls] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);


  const validateNode = (nodes) => {
    setValidatingNode(nodes);
    setCurrentNode(nodes);
    setBmcDetails({ ...bmcDetails, ip: nodes.ip });
    if (isRevalidate) {
      setIsRevalidate(false);
      setBmcFormVisible(true);
    } else {
      setBmcFormVisible(false);
      setIsRevalidate(true);
    }
  };


  useEffect(() => {
    if (progress === 100 && Ip && !fetchedUrls) {
      console.log("Triggering URL fetch with progress 100 and IBN:", Ip);
      fetch("http://192.168.249.100:9909/api/credentials", {
        headers: { ibn: Ip },
      })
        .then((response) => response.json())
        .then((urls) => {
          console.log("Fetched URLs:", urls);

          if (!urls.skylineDashboardUrl || !urls.cephDashboardUrl) {
            throw new Error("Missing required URLs in response");
          }

          setDeploymentDetails((prevDetails) => ({
            ...prevDetails,
            skylineUrl: urls.skylineDashboardUrl,
            cephUrl: urls.cephDashboardUrl,
          }));
          setFetchedUrls(true); // Mark URLs as fetched
        })
        .catch((error) => {
          console.error("Error fetching URLs:", error);
        });
    }
  }, [progress, Ip, fetchedUrls]);


  useEffect(() => {
    if (
      progress === 100 &&
      deploymentDetails.skylineUrl &&
      deploymentDetails.cephUrl &&
      !detailsSaved
    ) {
      console.log("Saving deployment details:", deploymentDetails);

      fetch("http://192.168.249.100:5000/api/saveDeploymentDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deploymentDetails),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Deployment details saved:", data);
          setDetailsSaved(true); // Mark details as saved
        })
        .catch((error) => {
          console.error("Error saving deployment details:", error);
        });
    }
  }, [progress, deploymentDetails, detailsSaved]);

  const statusMessage =
    progress === 100 ? "Successfully Deployed" : "Deployment in Progress";


  useEffect(() => {
    if (progress === 100 && !notificationShown) {
      notification.success({
        message: "Deployment Completed Successfully",
        description: "Your deployment has been completed successfully.",
        placement: "topRight", // Can be topLeft, topRight, bottomLeft, bottomRight
      });



      // Mark the notification as shown
      setNotificationShown(true);
    }
  }, [progress, notificationShown]);

  useEffect(() => {
    if (progress === 0) {
      setFetchedUrls(false);
      setDetailsSaved(false);
    }
  }, [progress]);


  useEffect(() => {
    if (!isDeploymentStarted || !targetServerIp) return; // Only proceed if deployment has started

    const eventSource = new EventSource(`http://192.168.249.100:5055/tail-logs?targetserver_ip=${targetServerIp}`);

    eventSource.onmessage = (event) => {
      const newLog = event.data;

      // Check if the log indicates a new file is starting (or any condition for clearing)
      if (newLog === "data: \n\n") {
        // Clear logs when a new file is detected
        setLogs([]);
      } else {
        // Append the new log to the logs state
        setLogs((prevLogs) => [...prevLogs, newLog]);
      }

      // Auto-scroll to the bottom of the log container
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    };

    eventSource.onerror = () => {
      console.error("Error in SSE connection.");
      eventSource.close();
    };

    return () => {
      eventSource.close(); // Clean up the SSE connection when component unmounts
    };
  }, [isDeploymentStarted, targetServerIp]); // Dependency array ensures this runs only when deployment starts or targetServerIp changes

  const validateDiskSelection = (_, value, disks) => {
    // Ensure value starts with '/dev/' (i.e., the format of the disk name)
    if (!value || !value.startsWith("/dev/")) {
      return Promise.reject(new Error("Please select a valid disk"));
    }

    // Find the selected disk from the disks array by comparing the value with '/dev/diskName'
    const selectedDisk = disks.find((disk) => `/dev/${disk.name}` === value);

    if (!selectedDisk) {
      return Promise.reject(new Error("Disk not found"));
    }

    // Extract the numeric part of the disk's capacity (ignoring units like 'G' or 'M')
    const capacity = parseFloat(selectedDisk.capacity.replace(/[^\d.]/g, ""));

    // Check if the capacity is in GB or another unit
    const isGB = selectedDisk.capacity.includes("G");

    // Convert MB to GB if the disk is in MB
    const capacityInGB = isGB ? capacity : capacity / 1024;

    // Validate if the capacity is at least 100 GB
    if (capacityInGB < 100) {
      return Promise.reject(
        new Error("Selected disk must have a capacity of at least 100GB.")
      );
    }

    // If everything is valid, resolve the promise
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Sending form data to backend API
      const response = await axios.post('http://192.168.249.100:9909/update-config', {
        ip: values.ibn,
        subnet: values.subnet,
        gateway: values.gateway,
        interface: values.interface,  // Assuming you're using the first interface
        disk: values.disk,             // Including the disk value
      });

      // Handle the response from the server
      if (response.data.message) {
        console.log(response.data.message);
        // Optionally close the modal after successful form submission
        setOpenOSModal(false);
        alert('Configuration updated successfully!');
        await handleDeployButtonClick();
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      // Show a user-friendly error message
      alert('There was an error updating the configuration. Please try again.');
    } finally {
      setLoading(false);
    }

    try {
      const response = await fetch("http://192.168.249.100:9909/ssh-connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          osip: values.ip, // Pass the entered IP as `osip`
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Success:", result.message || "SSH successfully started!");

        // Assuming the result message contains "SSH successful" or similar, we show SweetAlert
        if (result.message === "SSH connection established successfully.") {
          setTimeout(() => {
            Swal.fire({
              title: "Success!",
              text: "SSH connection established successfully!",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              // Trigger any necessary actions after the SweetAlert confirmation
            });
          }, 500);
        }
      } else {
        console.error("Error:", result.message || "Failed to start SSH.");
      }
    } catch (error) {
      console.error("Error starting SSH:", error);
      console.error("An unexpected error occurred while starting SSH.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const logContainer = document.getElementById("logContainer");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [logs]); // Trigger on every logs update

  const toggleLogss = () => {
    setIsLogsExpanded((prev) => !prev); // Toggle logs panel visibility
  };

  // Add new log dynamically (example)
  const addLog = (newLog) => {
    setLogs((prevLogs) => [...prevLogs, newLog]); // Add new log to the existing logs array
  };

  // Auto-scroll to the latest log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]); // This will run every time logs state is updated
  const showDeployModal = () => {
    setOpen(true);
  };

  const showOSModal = () => {
    setOpenOSModal(true); // Open the OS Boot Form modal
  };

  const closeOSModal = () => {
    setOpenOSModal(false); // Close the modal
    form.resetFields(); // Reset form fields
  };

  const handleConfirmation = () => {
    Modal.destroyAll();
    showOSModal();
    axios
      .post("http://192.168.249.100:9909/api/boot", { osType: "normal" })
      .then((response) => {
        console.log("Normal OS boot initiated");
      })
      .catch((error) => {
        console.error("Error initiating OS boot:", error);
      });

  };

  const showModal = () => {
    setIsModalOpen(true);
    setPopoverVisible({});
  };

  const handleDeploySubmit = (values) => {
    setLoading(true); // Set form loading state
    setIsDeploying(true); // Start deployment process

    // Simulate deployment progress
    setTimeout(() => {
      setIsDeploying(false); // End deployment
      setLoading(false); // End form loading
      onDeployTriggered(values); // Trigger deploy logic
    }, 3000); // Simulate a 5-second delay for deployment (replace with actual logic)
  };


  function fetchProgress(targetServerIP) {
    // Cancel any ongoing request before making a new one
    if (progressRequestControllerRef.current) {
      progressRequestControllerRef.current.abort();
    }

    // Create a new AbortController for the new request
    progressRequestControllerRef.current = new AbortController();
    const { signal } = progressRequestControllerRef.current;

    fetch(`http://192.168.249.100:5055/get-progress?targetserver_ip=${targetServerIP}`, { signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Request canceled or failed');
        }
        return response.json();
      })
      .then((data) => {
        setProgress(data.progress);
        setFilesProcessed(data.present_files);
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Progress request canceled');
        } else {
          console.error('Error fetching progress:', error);
        }
      });
  }

  const startDeploymentWithIP = (ip) => {
    if (!ip) {
      console.error('IP is not defined or invalid');
      return;
    }
    startDeployment(ip);
  };

  function startDeployment(ip) {
    console.log('Sending request with targetServerIp:', ip);
    setLoading(true);
    fetch('http://192.168.249.100:5055/start-deployment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetserver_ip: ip }),
    })
      .then(response => {
        // Check for a non-OK response (e.g., 400, 500)
        if (!response.ok) {
          return response.json().then(errorData => {
            // Log error message from the server
            console.error('Deployment Error:', errorData.error || 'Unknown error');
            throw new Error(errorData.error || 'Failed to start deployment');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Deployment Start Response:', data);
        if (data.message) {
          console.log(`Deployment for ${ip} started.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        console.log('Error starting deployment:', error.message);
      });
  }



  function cancelDeployment() {
    fetch('http://192.168.249.100:5055/cancel-deployment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetserver_ip: targetServerIp }),  // Ensure 'targetServerIp' is correctly defined
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        return response.text();  // Read as text first
      })
      .then(text => {
        console.log('Raw response text:', text);  // Log the raw response body for debugging

        try {
          const data = JSON.parse(text);  // Parse JSON here
          console.log(data);

          if (data.message) {
            console.log(`Deployment for ${targetServerIp} has been canceled.`);
          } else {
            console.log('Failed to cancel deployment: ' + (data.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          console.error('Error: Invalid response from server');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        console.error('Error canceling deployment: ' + error.message);  // Display the error message to the user
      });
  }

  function closeProgressModal() {
    cancelDeployment(); // Cancel the deployment
    setProgressModalVisible(false);
  }

  const handleDeployComplete = () => {
    console.log('Deployment Completed!');
    // Optionally, close the modal or reset form
    setOpen(false);
  };

  const startPolling = (targetServerIp) => {

    const progressInterval = setInterval(() => {
      fetch(`http://192.168.249.100:5055/get-progress?targetserver_ip=${targetServerIp}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setProgress(data.progress);
          setFilesProcessed(data.present_files);

          // Stop polling when progress reaches 100%
          if (data.progress >= 100) {
            clearInterval(progressInterval);
            setLoading(false);  // Stop loading spinner
          }
        })
        .catch((error) => {
          console.error('Error fetching progress:', error);
          clearInterval(progressInterval); // Stop polling on error
          setLoading(false); // Optionally stop loading spinner on error
        });
    }, 2000); // Poll every 2 seconds

    // Cleanup function to clear the interval when component unmounts
    return () => clearInterval(progressInterval);
  };


  // [targetServerIp]); // Re-run the effect if the targetServerIp changes

  const handleOk = async () => {
    try {
      setOpen(false);            // Close the main modal
      setIsModalOpen(false);     // Close the current modal
      setPopoverVisible((prev) => ({ ...prev })); // Ensure it's updated as needed, or remove this if not necessary

      // Show the validation in progress message
      MySwal.fire({
        title: "Validation in Progress",
        html: "Please wait while we process your request...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Wait for a fixed period (120000 ms = 2 minutes)
      await new Promise((resolve) => setTimeout(resolve, 120000));

      // Fetch validation data and set validated to true
      await fetchValidationData();
      setValidated(true);

      // Optional: Close the Swal loading dialog after completion
      Swal.close();
      Swal.fire({
        title: "Success",
        text: "Validation completed successfully!",
        confirmButtonText: "OK",
        confirmButtonColor: "#28a745",
      });

      setBmcFormVisible(false);
      setFormSubmitted(true);

    } catch (error) {
      console.error("Error setting PXE boot:", error);
      // Show error message
      Swal.fire({
        title: "Failed",
        text: "Failed to set PXE boot or fetch validation data. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  // const toggleLogs = () => {
  //   setIsLogsExpanded(!isLogsExpanded);
  // };

  const showLoading = () => {
    setOpen(true);
    setLoading(true);
    // Reset the form when the modal is opened
    form.resetFields();
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulate loading time (2 seconds)
  };

  const handleNextButtonClick = () => {
    setProgressModalVisible(false);
    next();

  };


  // const handleNextStep = () => {
  //   // Handle the "Next" button click (you can proceed to the next step here)
  //   console.log('Proceed to the next step');
  //   setIsModalVisible(false);  // Optionally hide the modal after clicking "Next"
  // };


  const handleBmcFormSubmit = async (ip, bmcDetails) => {
    setBmcFormVisible(false);
    setPopoverVisible((prev) => ({ ...prev, [ip]: false }));
    showValidationInProgressPopup(); // Show progress popup initially

    try {
      axios
        .post("http://192.168.249.100:9909/api/boot", { osType: "live" })
        .then((response) => console.log("Live OS boot initiated"))
        .catch((error) => console.error("Error in booting Live OS:", error));

      const response = await axios.post(
        "http://192.168.249.100:8000/set_pxe_boot",
        bmcDetails
      );
      console.log("BMC Details submitted:", bmcDetails);
      console.log("Server response:", response.data);

      await new Promise((resolve) => setTimeout(resolve, 120000)); // 2-minute delay

      await fetchValidationData(); // Initial validation attempt
      setValidated(true); // Mark as validated
    } catch (error) {
      Swal.close();
      message.error("Wrong credentials or check the system's power status.");
    }
  };

  const showValidationInProgressPopup = () => {
    MySwal.fire({
      title: "Validation in Progress",
      html: (
        <div style={{ overflowY: 'hidden' }}>
          <div style={{ marginBottom: '20px' }}>Please wait while we process your request...</div>
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      ),
      allowOutsideClick: false,
      showConfirmButton: false,
      allowEscapeKey: false,
      didOpen: () => {
        // No need to use Swal.showLoading() anymore
      },
    });
  };

  const fetchValidationData = async (isRetry = false, retryCount = 0) => {
    const maxRetries = 3; // Maximum number of retries allowed

    if (isRetry) {
      // Close any previous Swal dialog before retrying
      Swal.close();
      showValidationInProgressPopup(); // Show the loading popup only when retrying
    }

    try {
      const response = await fetch("/hardware_summary.json");
      if (!response.ok) {
        throw new Error("Failed to fetch validation data");
      }
      const data = await response.json();
      console.log("Fetched validation data:", data);

      setValidationData(data);

      // Extract interfaces from the fetched data
      const fetchedInterfaces = data.interfaces
        ? data.interfaces.split(",")
        : [];
      setInterfaces(fetchedInterfaces);

      const fetchedDisks = data.disk_capacities
        ? data.disk_capacities.map((disk) => {
          const [name, capacity] = Object.entries(disk)[0];
          // Remove the colon (:) from the disk name
          const cleanedName = name.replace(/:$/, "");
          return { name: cleanedName, capacity };
        })
        : [];
      setDisks(fetchedDisks);

      // Compare specifications
      const comparisonResults = compareSpecs(data, requirementData);
      console.log("Comparison Results:", comparisonResults);

      const overallStatus =
        comparisonResults.cpuCoresPassed &&
          comparisonResults.memoryPassed &&
          comparisonResults.diskPassed &&
          comparisonResults.nicPassed
          ? "Passed"
          : "Failed";

      // Update validation results
      setValidationResults((prevResults) => ({
        ...prevResults,
        [currentNode.ip]: {
          status: overallStatus,
          cpuCoresPassed: comparisonResults.cpuCoresPassed,
          memoryPassed: comparisonResults.memoryPassed,
          diskPassed: comparisonResults.diskPassed,
          nicPassed: comparisonResults.nicPassed,
        },
      }));

      if (overallStatus === "Passed") {
        Swal.close();

        // Success message after validation
        Swal.fire({
          title: "Success",
          text: "Validation completed successfully!",
          confirmButtonText: "OK",
          confirmButtonColor: "#28a745",
        });
        setBmcFormVisible(false);
        setFormSubmitted(true);
        return; // Terminate further retries
      } else {
        throw new Error("Validation failed");
      }
    } catch (error) {
      console.error("Error fetching validation data:", error);

      // Close any previous Swal alert before retrying
      Swal.close();

      // Show retry popup
      Swal.fire({
        title: "File has not received yet!",
        text: "Would you like to continue waiting for the file?",
        showCancelButton: true,
        confirmButtonText: "Continue",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#007bff",
        cancelButtonColor: "#dc3545",
        customClass: {
          actions: "horizontal-buttons", // Add custom class to actions container
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Close any previous Swal alert before retrying
          Swal.close();

          // Show progress popup again before retrying
          showValidationInProgressPopup();

          // Wait for 2 minutes before retrying the validation fetch
          await new Promise((resolve) => setTimeout(resolve, 120000)); // 2-minute delay

          // Retry fetching validation data
          await fetchValidationData(true, retryCount + 1); // Retry fetching validation data
        } else {
          setBmcFormVisible(false);
          setFormSubmitted(true);
        }
      });

      // Add styles for horizontal buttons with 90px width
      const style = document.createElement("style");
      style.innerHTML = `
        .swal2-actions.horizontal-buttons {
          display: flex !important;
          flex-direction: row !important; /* Arrange buttons in a horizontal row */
          justify-content: center !important; /* Center align the buttons */
          gap: 10px; /* Add spacing between the buttons */
        }
        .swal2-actions.horizontal-buttons .swal2-confirm,
        .swal2-actions.horizontal-buttons .swal2-cancel {
          width: 100px; /* Set the width of both buttons to 90px */
        }
      `;
      document.head.appendChild(style);
    }
  };

  const handleNextClick = () => {
    if (selectedIp) {
      onDeployTriggered(selectedIp);
      setProgressVisible(false); // Close the progress modal
    }
  };

  const handleDeployButtonClick = async () => {
    setProgressVisible(true);
    setOpen(false);
    try {
      // First API: Initiate Live OS boot
      await axios
        .post("http://192.168.249.100:9909/api/boot", { osType: "normal" })
        .then((response) => console.log("Normal OS boot initiated"))
        .catch((error) => console.error("Error in booting Live OS:", error));

      // Second API: Submit BMC details (reusing the same details)
      const response = await axios.post(
        "http://192.168.249.100:8000/set_pxe_boot",
        bmcDetails
      );
      console.log("Os Deployment started");
    } catch (error) {
      console.error("Error during deployment:", error);
    }
  };

  const handleCancel = () => {
    setBmcFormVisible(false);
    setValidatingNode(null);
    setIsModalOpen(false);
  };
  const handleInfoButtonClick = () => {
    // Check if the validation results exist for the current node
    if (
      !validationResults ||
      !currentNode ||
      !validationResults[currentNode.ip]
    ) {
      Swal.fire({
        title: "Error",
        text: "Validation not done or BMC details are incorrect. Please check and try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc3545",
      });
      return;
    }

    // Get the current validation result for the node
    const result = validationResults[currentNode.ip];

    // Fetch min requirements and result values
    const minCpuCores = requirementData.cpu_cores;
    const minMemory = parseInt(requirementData.memory);
    const minDiskCount = requirementData.disk_count; // Ensure this is a number
    const minNic1GCount = parseInt(requirementData.nic_1g_count); // Convert to number
    const minNic10GCount = parseInt(requirementData.nic_10g_count) || 0; // Default to 0 if not present
    const minNicTotalCount = minNic1GCount + minNic10GCount; // Correctly sum both NIC counts

    // Parse validation values
    const validationCpuCores = parseInt(validationData.cpu_cores);
    const validationMemory = parseInt(validationData.memory);
    const validationDiskCount = parseInt(validationData.disk_count); // Convert to number
    const validationNic1GCount = parseInt(validationData.nic_1g_count); // Convert to number
    const validationNic10GCount = parseInt(validationData.nic_10g_count); // Convert to number
    const validationNicTotalCount =
      validationNic1GCount + validationNic10GCount; // Sum both NIC counts

    // Determine heading color based on status
    const headingColor =
      result.cpuCoresPassed &&
        result.memoryPassed &&
        result.diskPassed &&
        result.nicPassed
        ? "#28a745"
        : "#dc3545";

    // Create HTML message with Min Req Value and Result Value
    const msg = `
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: ${headingColor};">
        TEST RESULT: ${result.cpuCoresPassed &&
        result.memoryPassed &&
        result.diskPassed &&
        result.nicPassed
        ? "PASSED"
        : "FAILED"
      }
    </h1>
    <div style="cursor: pointer; font-size: 1.1rem; color: #007bff; margin-bottom: 10px;" id="toggleReport">
        Detailed Report <span id="arrow" style="font-size: 1.1rem;">▼</span>
    </div>
   <div id="reportWrapper" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
            <table style="width:100%; border-collapse: collapse; margin-top: 10px; border-radius: 10px; overflow: hidden;">
                <thead style="background-color: #f8f9fa;">
                    <tr>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Parameter</th>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Min Req </th>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Rec</th>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Result </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">CPU Cores</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minCpuCores}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">8</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationCpuCores}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">RAM</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minMemory} GB</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">16 GB</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationMemory} GB</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">Disk Count</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minDiskCount}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">5</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationDiskCount}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">NIC Count</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minNicTotalCount}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">3</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationNicTotalCount}</td>
                    </tr>
                </tbody>
            </table>
    </div>`;

    // Display the Swal modal
    Swal.fire({
      confirmButtonText: "OK",
      confirmButtonColor: "#17a2b8",
      html: msg,
      didRender: () => {
        const toggleButton = document.getElementById("toggleReport");
        const reportWrapper = document.getElementById("reportWrapper");
        const arrow = document.getElementById("arrow");

        toggleButton.addEventListener("click", () => {
          if (reportWrapper.style.maxHeight === "0px") {
            reportWrapper.style.maxHeight = reportWrapper.scrollHeight + "px";
            arrow.textContent = "▲"; // Change arrow to up arrow
          } else {
            reportWrapper.style.maxHeight = "0px";
            arrow.textContent = "▼"; // Change arrow to down arrow
          }
        });
      },
    });
  };

  const compareSpecs = (validationData, requirementData) => {
    const validationMemory = parseInt(validationData.memory.replace(" Gi", ""));
    const validationCpuCores = parseInt(validationData.cpu_cores);
    const validationDiskCount = parseInt(validationData.disk_count);
    const validationNic1GCount = parseInt(validationData.nic_1g_count);
    const validationNic10GCount = parseInt(validationData.nic_10g_count) || 0; // Default to 0 if not present
    const validationNicTotalCount =
      validationNic1GCount + validationNic10GCount;

    const minCpuCores = requirementData.cpu_cores;
    const minMemory = parseInt(requirementData.memory.replace(" Gi", ""));
    const minDiskCount = parseInt(requirementData.disk_count);
    const minNic1GCount = requirementData.nic_1g_count;
    console.log("Parsed Min NIC 1G Count:", minNic1GCount);
    const minNic10GCount = parseInt(requirementData.nic_10g_count) || 0; // Default to 0 if not present
    console.log("Parsed Min NIC 10G Count:", minNic10GCount);
    const minNicTotalCount = minNic1GCount + minNic10GCount; // Total NIC requirement
    console.log("Min Total NIC Count:", minNicTotalCount);

    return {
      cpuCoresPassed: validationCpuCores >= minCpuCores,
      memoryPassed: validationMemory >= minMemory,
      diskPassed: validationDiskCount >= minDiskCount,
      nicPassed: validationNicTotalCount >= minNicTotalCount, // Compare total NICs
    };
  };

  useEffect(() => {
    if (!targetServerIp) return; // Don't start polling if there's no IP

    // Start polling when targetServerIp changes
    const cleanUpPolling = startPolling(targetServerIp);

    // Cleanup on component unmount or when IP changes
    return () => {
      cleanUpPolling(); // Clears the interval when component unmounts or IP changes
    };
  }, [targetServerIp]);

  const onDeployTriggered = async (values) => {
    setLoading(true);
    setVisible(false);
    setOpen(false);
    setProgressModalVisible(true);

    // Collect the form data from the form values
    const { ibn, gateway, dns, interface1, interface2 } = values;

    setDeploymentDetails({
      cloudName,
      ip: ibn,
      deploymentTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),  // Custom format      
      userId: userId,
      bmcDetails: {
        ip: bmcDetails.ip,
        username: bmcDetails.username,
        password: bmcDetails.password, // If sensitive, consider masking or hashing before storing
      },
    });
    setIp(ibn)
    onIbnUpdate(ibn)
    setTargetServerIp(ibn);
    setIsDeploymentStarted(true);
    startDeploymentWithIP(ibn);

    // Call startPolling after ibn has been assigned
    // startDeployment();  // assuming startDeployment doesn't rely on ibn
    startPolling(ibn);  // This should be after ibn is defined

    console.log('Form values:', values);

    // Create the form data object to send to the backend
    const formData = {
      IP_ADDRESS: ibn,
      GATEWAY: gateway,
      DNS_SERVERS: dns,
      INTERFACE_01: interface1,
      INTERFACE_02: interface2,
      DOCKER_TOKEN: "dckr_pat_D_pxIidbzQAoVJ5sfE65S-O-J9c",
      GITHUB_TOKEN: "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"
    };


    // Convert the formData object to a JSON string for the file
    const jsonString = JSON.stringify(formData, null, 2);

    // Create a Blob from the JSON string (this is how we'll send it as a file)
    const blob = new Blob([jsonString], { type: "application/json" });
    const fileName = "config.json"; // File name for the blob

    // Create a FormData object to append the file and send to the backend
    const formDataToSend = new FormData();
    formDataToSend.append("file", blob, fileName);  // Append the JSON file
    formDataToSend.append("ibn", ibn); // Append other data to FormData

    // Send the FormData object (file and other form data) to the backend

    // Sending the form data via POST request
    fetch("http://192.168.249.100:9909/upload", {
      method: "POST",
      body: formDataToSend, // Send FormData as the request body
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        // Handle success on the backend (e.g., show success message)
        notification.success({
          message: "Deployment Initialized",
          description: "Your deployment request has been submitted successfully.",
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        notification.error({
          message: "Deployment Failed",
          description: "There was an error submitting your request.",
        });
        setProgressModalVisible(false);
      });


    // Additional fetch request for deployment
    fetch("http://192.168.249.100:8080/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: ibn, // Use the IP from the form
        username: "pinaka", // Assuming static credentials
        password: "pinaka",
        // Add other necessary data for deployment
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle successful deployment response here
      })
      .catch((error) => {
        // Handle deployment error here
      })
      .finally(() => {
        setLoading(false); // Ensure that loading state is turned off
        setOpen(false); // Close the modal after the process
      });
  };

  // const startDeployment = () => {
  //   setLoading(true);
  // };

  const paginatedNodes = nodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const showPopover = (ip) => {
    setPopoverVisible((prev) => ({ ...prev, [ip]: true }));
  };

  const hidePopover = (ip) => {
    setPopoverVisible((prev) => ({ ...prev, [ip]: false }));
  };

  const columns = [
    {
      title: "IP Address",
      dataIndex: "ip",
      key: "ip",
      align: "center",
    },
    {
      title: "Validate",
      dataIndex: "validate",
      key: "validate",
      align: "center",
      render: (_, record) => (
        <>
          <Popover
            content={
              <Form
                layout="vertical"
                onFinish={() => handleBmcFormSubmit(record.ip, bmcDetails)}
                style={{ width: '200px', height: 'auto' }} // Adjust height to auto for dynamic content
              >
                <Form.Item label="BMC IP" name="bmcIp" style={{ marginBottom: '1px' }}>
                  <Input
                    placeholder="Enter BMC IP"
                    value={bmcDetails.ip}
                    onChange={(e) =>
                      setBmcDetails({ ...bmcDetails, ip: e.target.value })
                    }
                  />
                </Form.Item>

                <Form.Item label="Username" name="username" style={{ marginBottom: '1px' }}>
                  <Input
                    placeholder="Enter Username"
                    value={bmcDetails.username}
                    onChange={(e) =>
                      setBmcDetails({ ...bmcDetails, username: e.target.value })
                    }
                  />
                </Form.Item>

                <Form.Item label="Password" name="password" style={{ marginBottom: '1px' }}>
                  <Input.Password
                    placeholder="Enter Password"
                    value={bmcDetails.password}
                    onChange={(e) =>
                      setBmcDetails({ ...bmcDetails, password: e.target.value })
                    }
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: '4px' }}>
                  <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                    Submit
                  </Button>
                </Form.Item>

                {/* Adjusted gap and centered the link */}
                <div style={{ textAlign: 'center', marginTop: '4px' }}> {/* Reduced marginTop */}
                  <span
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                    onClick={showModal}
                  >
                    Don't have BMC?
                  </span>
                </div>
              </Form>
            }
            title="Enter BMC Credentials"
            trigger="click"
            visible={popoverVisible[record.ip]}
            onVisibleChange={(visible) => {
              if (visible) {
                showPopover(record.ip);
              } else {
                hidePopover(record.ip);
              }
            }}
            placement="right"
          >
            <Button
              type="primary"
              style={{ width: "80px" }}
              onClick={() => {
                // Perform the Axios request first
                axios
                  .post("http://192.168.249.100:9909/api/boot", { osType: "live" })
                  .then((response) => {
                    console.log("Live OS boot initiated");

                    // After boot initiation, handle validation logic
                    if (validated) {
                      // If validated, show the BMC form again for revalidation
                      setIsRevalidate(true);  // Set revalidation state
                      validateNode(record);  // Trigger the function to show BMC form
                    } else {
                      // If not validated yet, start the initial validation
                      validateNode(record);  // Trigger initial validation process
                    }
                  })
                  .catch((error) => {
                    console.error("Error initiating Live OS boot:", error);
                  });
              }}
            >
              {validated ? 'Revalidate' : 'Start'}
            </Button>
          </Popover>
          <Modal
            title="Dont have BMC?"
            open={isModalOpen}  // Controls visibility based on state
            onOk={handleOk}   // Close the modal when "OK" is clicked
            onCancel={handleCancel}
            footer={[
              <Button key="ok" type="primary" onClick={handleOk} style={{ width: '80px' }}>
                NEXT
              </Button>
            ]}
          >
            <p>If your system doesn't have a BMC, you can follow the steps below to manually turn on PXE boot:</p>
            <ul>
              <li>Restart the system and enter the BIOS setup.</li>
              <li>Navigate to the Boot Menu or Boot Options section.</li>
              <li>Enable PXE Boot (sometimes listed as "Network Boot" or "Boot from LAN").</li>
              <li>Save changes and exit the BIOS setup.</li>
              <li>Ensure your system is connected to the network and can access PXE boot resources.</li>
            </ul>
            <p><strong>If all the above steps are done, click on the Next button.</strong></p>
          </Modal>
        </>
      ),
    },
    {
      title: "Result",
      dataIndex: "result",
      key: "result",
      align: "center",
      render: (_, node) => {
        const result = validationResults[node.ip];

        if (!result) {
          return "Not Validated";
        } else if (result.status === "Passed") {
          return (
            <>
              <Button
                type="primary"
                style={{ width: "80px", backgroundColor: "#28a745" }}
                // style={{
                //   padding: "5px 11px",
                //   color: "#fff",
                //   cursor: "pointer",
                //   margin: "5px",
                //   width: "80px"
                // }}
                onClick={() => handleInfoButtonClick(node.ip)}
              >
                Info
              </Button>
            </>
          );
        } else {
          return (
            <>
              <Button
                type="primary"
                style={{ width: "80px", backgroundColor: "red" }}
                // style={{
                //   backgroundColor: "red",
                //   padding: "5px 11px",
                //   color: "#fff",
                //   cursor: "pointer",
                //   margin: "5px",
                //   width: "80px"
                // }}
                onClick={() => handleInfoButtonClick(node.ip)}
              >
                Info
              </Button>
            </>
          );
        }
      },
    },
    {
      title: "OS Deploy",
      dataIndex: "os",
      key: "os",
      align: "center",
      render: (_, node) => {
        const result = validationResults[node.ip];

        if (!result) {
          return null;
        } else if (result.status === "Passed") {
          return (
            <>
              <Button
                type="primary"
                style={{ width: "80px", backgroundColor: "#007bff" }}
                onClick={() => {
                  Modal.confirm({
                    title: "Warning",
                    content: (
                      <>
                        <p>Are you certain you wish to proceed with the deployment?</p>
                        <p>Important Considerations:</p>
                        <ul>
                          <li>PinakaOS will be initialized.</li>
                          <li>All disks will be completely erased, leading to permanent data loss.</li>
                        </ul>
                        <p>We strongly recommend backing up all critical information prior to continuing.</p>
                      </>
                    ),
                    okText: "Confirm",
                    cancelText: "Cancel",
                    style: { top: '20vh' },
                    onOk: handleConfirmation,
                    onCancel: () => Modal.destroyAll(),
                    footer: [
                      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Button
                          style={{ width: "80px", marginRight: "10px", color: '#007bff' }}
                          onClick={handleConfirmation}
                        >
                          Confirm
                        </Button>
                        <Button
                          style={{ width: "80px" }}
                          onClick={() => Modal.destroyAll()}
                        >
                          Cancel
                        </Button>
                      </div>
                    ]
                  });
                }}
              >
                Boot
              </Button>

              {/* OS Boot Form Modal */}
              <Modal
                title="OS Boot Form"
                visible={openOSModal}
                onCancel={() => setOpenOSModal(false)} // Close the modal
                footer={null}
                width={600}
                destroyOnClose={true}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit} // Handle form submission
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="ibn"
                        label="IP Address"
                        rules={[{ required: true, message: 'Please enter IP address' }]}
                      >
                        <Input placeholder="Enter IP" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="subnet"
                        label="Subnet Mask"
                        rules={[{ required: true, message: 'Please enter subnet mask' }]}
                      >
                        <Input placeholder="Enter Subnet Mask" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="interface"
                        label="Interface"
                        rules={[{ required: true, message: 'Please select Interface 1' }]}
                      >
                        <Select placeholder="Select Interface 1">
                          {interfaces.map((iface) => (
                            <Select.Option key={iface} value={iface}>
                              {iface}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="gateway"
                        label="Gateway"
                        rules={[{ required: true, message: 'Please enter Gateway' }]}
                      >
                        <Input placeholder="Enter Gateway" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="disk"
                        label="Disk"
                        rules={[
                          { required: true, message: "Please select a disk" },
                          { validator: (rule, value) => validateDiskSelection(rule, value, disks) },
                        ]}
                      >
                        <Select placeholder="Select Disk">
                          {disks.map((disk) => (
                            <Select.Option key={disk.name} value={`/dev/${disk.name}`}>
                              {`/dev/${disk.name} ${disk.capacity}`}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <div style={{ textAlign: 'right' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{ width: '80px' }}
                        disabled={
                          !form.isFieldsTouched(true) ||
                          form.getFieldsError().some(({ errors }) => errors.length > 0) ||
                          Object.values(form.getFieldsValue()).some(value => value === undefined || value === '')
                        }
                        onClick={() => {
                          Modal.destroyAll();
                        }}
                      >
                        Boot
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              </Modal>

            </>
          );
        } else {
          return null;
        }
      },
    },
    {
      title: 'Deploy',
      dataIndex: 'deploy',
      key: 'deploy',
      align: 'center',
      render: (_, node) => {
        // const result = validationResults[node.ip];
        // if (!result) return null; // If no validation result, return nothing
        // if (result.status === 'Passed') {
        return (
          <>
            <Button type="primary" style={{ width: '80px' }} onClick={showDeployModal}>
              Deploy
            </Button>

            <Modal
              title="Deployment Form"
              visible={open}
              onCancel={() => setOpen(false)}
              footer={null}
              width={600}
              destroyOnClose={true}
              maskClosable={false}
              keyboard={false}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onDeployTriggered}
                initialValues={{}} // Optional initial values
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ibn"
                      label="IP/CIDR"
                      rules={[{ required: true, message: 'Please enter IP/CIDR' }]}
                    >
                      <Input placeholder="Enter IP/CIDR" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="interface1"
                      label="Interface 1"
                      rules={[{ required: true, message: 'Please select Interface 1' }]}
                    >
                      <Input placeholder="Enter Gateway" />
                      {/* <Select placeholder="Select Interface 1">
                          {interfaces.map((iface) => (
                            <Select.Option key={iface} value={iface}>
                              {iface}
                            </Select.Option>
                          ))}
                        </Select> */}
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="dns"
                      label="DNS"
                      rules={[{ required: true, message: 'Please enter DNS' }]}
                    >
                      <Input placeholder="Enter DNS" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="interface2"
                      label="Interface 2"
                      rules={[{ required: true, message: 'Please select Interface 2' }]}
                    >
                      <Input placeholder="Enter Gateway" />
                      {/* <Select placeholder="Select Interface 2">
                          {interfaces.map((iface) => (
                            <Select.Option key={iface} value={iface}>
                              {iface}
                            </Select.Option>
                          ))}
                        </Select> */}
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="gateway"
                      label="Provider NGW"
                      rules={[{ required: true, message: 'Please enter Gateway' }]}
                    >
                      <Input placeholder="Enter Gateway" />
                    </Form.Item>
                  </Col>
                </Row>
                {/* Align the button to the right */}
                <Form.Item>
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ width: '80px' }}  // Set width to 80px
                    >
                      Deploy
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Modal>
            <Modal
              visible={isProgressModalVisible}
              footer={null}
              onCancel={closeProgressModal}
              title={progress === 100 ? `Successfully Deployed ${cloudName} Cloud 🎉` : `Deployment in Progress for ${cloudName} Cloud`}
              maskClosable={false}
              style={{ position: 'relative' }} // Ensure modal container has relative positioning
              keyboard={false}
            >
              {/* Your existing content */}
              <DeploymentProgressBar
                progress={progress}
                filesProcessed={filesProcessed}
                loading={loading}
                statusMessage={statusMessage}
              />

              <button
                onClick={toggleLogss}
                style={{
                  display: 'block',
                  margin: '10px auto',
                  background: 'none',
                  border: 'none',
                  color: '#1890ff',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  outline: 'none',
                }}
              >
                {isLogsExpanded ? 'Hide Logs' : 'View Logs'}
              </button>

              {isLogsExpanded && (
                <div
                  id="logContainer"
                  style={{
                    backgroundColor: '#212529',
                    color: 'white',
                    padding: '10px',
                    height: '150px',
                    width: '100%',
                    borderRadius: '5px',
                    overflowY: 'hidden',
                    overflowX: 'hidden',
                    scrollBehavior: 'smooth',
                    marginBottom: '16px', // Ensure space between logs and other content
                  }}
                >
                  {logs.length === 0 ? (
                    <p style={{ color: 'gray' }}>Wait for logs to be generated...</p>
                  ) : (
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                      {logs.map((log, index) => (
                        <li key={index} className="log-item" style={{ marginBottom: 8 }}>
                          <span style={{ color: '#6c757d' }}>→</span> {log}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {progress === 100 && (
                <button
                  onClick={handleNextButtonClick}
                  style={{
                    position: 'absolute', // Position relative to the modal container
                    bottom: '0px',
                    marginBottom: '1px',
                    right: '16px',
                    width: '70px',
                    height: '30px',
                    background: '#1890ff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    display: 'flex', // Flexbox for centering text
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: '14px',
                  }}
                >
                  Next
                </button>
              )}
            </Modal>
          </>
        );
        // } else {
        //   return null; // If validation fails, return nothing
        // }
      },
    },
  ];
  return (
    <div style={{ padding: "24px" }}>
      <h5>
        <CloudOutlined />
        &nbsp; &nbsp;{cloudName} Cloud
      </h5>
      <Breadcrumb style={{ marginBottom: "16px" }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Deployment</Breadcrumb.Item>
        <Breadcrumb.Item>Discovery</Breadcrumb.Item>
        <Breadcrumb.Item>Validation</Breadcrumb.Item>
      </Breadcrumb>
      <Divider />
      <Table
        columns={columns}
        dataSource={nodes} // Use the combined data source
        rowKey="ip"
        pagination={{ pageSize: 4 }}
      />
      <ProgressModal
        visible={progressVisible}
        onClose={() => setProgressVisible(false)}
      // onNext={onDeployTriggered}
      />
      {/* <Report ibn={ibn} /> */}
    </div>
  );
};
export default Validation;

