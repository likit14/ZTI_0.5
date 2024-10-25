import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import withReactContent from 'sweetalert2-react-content';
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from "../Styles/Validation.module.css";
import Swal from 'sweetalert2';
// import validationData from '../Comparison/sample.json'
import requirementData from '../Comparison/min_requirements.json'

const Validation = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [bmcFormVisible, setBmcFormVisible] = useState(false);
    const [currentNode, setCurrentNode] = useState(null);
    const [bmcDetails, setBmcDetails] = useState({ ip: '', username: '', password: '' });
    const [scanResults, setScanResults] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [validationData, setValidationData] = useState(null); // State for validation data
    const [interfaces, setInterfaces] = useState([]); // State to store interface options

    const itemsPerPage = 4;
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedNodes } = location.state || { selectedNodes: [] };

    useEffect(() => {
        fetchScanResults();
        // fetchValidationData(); // Fetch validation data when component mounts
    }, []);

    const fetchScanResults = async () => {
        try {
            const response = await axios.get('http://192.168.249.101:8000/scan');
            setScanResults(response.data);
        } catch (error) {
            console.error('Error fetching scan results:', error);
        }
    };


    const validateNode = (node) => {
        setValidatingNode(node);
        setCurrentNode(node);
        setBmcDetails({ ...bmcDetails, ip: node.ip });
        setBmcFormVisible(true);
    };

    const handleBack = () => {
        navigate(-1);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleCheckboxChange = (event, node) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, node]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.ip !== node.ip));
        }
    };

    // const handleDeploy = () => {
    //     navigate('/designatednode', { state: { selectedNodes: selectedRows } });
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
    // };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const MySwal = withReactContent(Swal);

    const handleBmcFormSubmit = async (event) => {
        event.preventDefault();

        setBmcFormVisible(false);
        // Show the SweetAlert2 modal with a progress bar
        MySwal.fire({
            title: 'Validation in Progress',
            html: 'Please wait while we process your request...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();  // Display the loading spinner
            },
        });
        try {
            axios.post("http://192.168.249.101:9909/api/boot", { osType: "live" })
                .then(response => console.log("Live OS boot initiated"))
                .catch(error => console.error("Error in booting Live OS:", error));

            // Submit BMC details to the server
            const response = await axios.post('http://192.168.249.101:8000/set_pxe_boot', bmcDetails);
            console.log('BMC Details submitted:', bmcDetails);
            console.log('Server response:', response.data); // Log the server response for debugging



            // Introduce a delay after sending the PXE boot request
            await new Promise((resolve) => setTimeout(resolve, 120000)); // 2-minute delay (120,000 milliseconds)

            // Fetch validation data after the delay
            await fetchValidationData();

        } catch (error) {
            console.error('Error in form submission:', error);
        }
    };

    const fetchValidationData = async () => {
        try {
            const response = await fetch('/hardware_summary.json'); // Fetching the file from the public directory
            if (!response.ok) {
                throw new Error('Failed to fetch validation data');
            }
            const data = await response.json();
            console.log('Fetched validation data:', data); // Log fetched data for debugging

            // Set the fetched data to state
            setValidationData(data);

            // Extract interfaces from the fetched data and convert them into an array
            const fetchedInterfaces = data.interfaces ? data.interfaces.split(',') : [];
            setInterfaces(fetchedInterfaces);

            // Comparison logic using the fetched data
            const comparisonResults = compareSpecs(data, requirementData);

            // Determine overall status
            const overallStatus =
                comparisonResults.cpuCoresPassed &&
                    comparisonResults.memoryPassed &&
                    comparisonResults.diskPassed &&
                    comparisonResults.nicPassed ? 'Passed' : 'Failed';

            // Store results in validationResults
            setValidationResults(prevResults => ({
                ...prevResults,
                [currentNode.ip]: {
                    status: overallStatus,
                    cpuCoresPassed: comparisonResults.cpuCoresPassed,
                    memoryPassed: comparisonResults.memoryPassed,
                    diskPassed: comparisonResults.diskPassed,
                    nicPassed: comparisonResults.nicPassed,
                }
            }));

            // Show success message after all operations
            Swal.fire({
                title: 'Success',
                text: 'Validation completed successfully!',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745',
            });

            setBmcFormVisible(false);
            setFormSubmitted(true);
        } catch (error) {
            console.error('Error setting PXE boot:', error);

            // Show error message if any operation fails
            Swal.fire({
                title: 'Failed',
                text: 'Failed to set PXE boot or fetch validation data. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545'
            });

            setBmcFormVisible(false);
            setFormSubmitted(true);
        }
    };
    const handleDeployButtonClick = async () => {
        try {
            // First API: Initiate Live OS boot
            await axios.post("http://192.168.249.101:9909/api/boot", { osType: "normal" })
                .then(response => console.log("Normal OS boot initiated"))
                .catch(error => console.error("Error in booting Live OS:", error));

            // Second API: Submit BMC details (reusing the same details)
            const response = await axios.post('http://192.168.249.101:8/se_pxe_boot', bmcDetails);
            console.log('BMC Details submitted:', bmcDetails);
            console.log('Server response:', response.data);

        } catch (error) {
            console.error('Error during deployment:', error);
        }
    };
    const handleCancel = () => {
        setBmcFormVisible(false);
        setValidatingNode(null);
    };
    const handleInfoButtonClick = () => {
        // Check if the validation results exist for the current node
        if (!validationResults || !currentNode || !validationResults[currentNode.ip]) {
            Swal.fire({
                title: 'Error',
                text: 'Validation not done or BMC details are incorrect. Please check and try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545'
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
        const validationNicTotalCount = validationNic1GCount + validationNic10GCount; // Sum both NIC counts

        // Determine heading color based on status
        const headingColor = result.cpuCoresPassed && result.memoryPassed && result.diskPassed && result.nicPassed ? "#28a745" : "#dc3545";

        // Create HTML message with Min Req Value and Result Value
        const msg = `
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: ${headingColor};">
            TEST RESULT: ${result.cpuCoresPassed && result.memoryPassed && result.diskPassed && result.nicPassed ? "PASSED" : "FAILED"}
        </h1>
        <div style="cursor: pointer; font-size: 1.1rem; color: #007bff; margin-bottom: 10px;" id="toggleReport">
            Detailed Report <span id="arrow" style="font-size: 1.1rem;">▼</span>
        </div>
        <div id="reportWrapper" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
            <table style="width:100%; border-collapse: collapse; margin-top: 10px; border-radius: 10px; overflow: hidden;">
                <thead style="background-color: #f8f9fa;">
                    <tr>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">PARAMETER</th>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Min Req Value</th>
                        <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Result Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">CPU Cores</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minCpuCores}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationCpuCores}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">RAM</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minMemory} GB</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationMemory} GB</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">Disk Count</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minDiskCount}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationDiskCount}</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">NIC Count</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minNicTotalCount}</td>
                        <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationNicTotalCount}</td>
                    </tr>
                </tbody>
            </table>
        </div>`;

        // Display the Swal modal
        Swal.fire({
            confirmButtonText: 'OK',
            confirmButtonColor: '#17a2b8',
            html: msg,
            didRender: () => {
                const toggleButton = document.getElementById('toggleReport');
                const reportWrapper = document.getElementById('reportWrapper');
                const arrow = document.getElementById('arrow');

                toggleButton.addEventListener('click', () => {
                    if (reportWrapper.style.maxHeight === '0px') {
                        reportWrapper.style.maxHeight = reportWrapper.scrollHeight + 'px';
                        arrow.textContent = '▲';  // Change arrow to up arrow
                    } else {
                        reportWrapper.style.maxHeight = '0px';
                        arrow.textContent = '▼';  // Change arrow to down arrow
                    }
                });
            }
        });
    };

    const compareSpecs = (validationData, requirementData) => {
        const validationMemory = parseInt(validationData.memory.replace(" Gi", ""));
        const validationCpuCores = parseInt(validationData.cpu_cores);
        const validationDiskCount = parseInt(validationData.disk_count);
        const validationNic1GCount = parseInt(validationData.nic_1g_count);
        const validationNic10GCount = parseInt(validationData.nic_10g_count) || 0; // Default to 0 if not present
        const validationNicTotalCount = validationNic1GCount + validationNic10GCount;


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


    const handleDeployClick = (ip) => {
        Swal.fire({
            title: "Management Network",
            width: "60%",
            html: `
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; padding: 10px; margin-top: 20px;">
             <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; align-items: center;">
            <span style="margin-left: 50px; font-weight: bold;">IP/CIDR</span>
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <span style="margin-right: 5px; color: red;">*</span>           
            <span style="margin-right: 10px; font-weight: bold;">OOB&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <input type="text" placeholder="Enter IP/CIDR" 
                style="padding: 8px; border-radius: 5px; 
                       border: 1px solid #ccc; width: 120px;">
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <span style="margin-right: 5px; color: red;">*</span>           
            <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Mgmt IP</span>
            <input type="text" placeholder="Enter Mgmt IP" 
                style="padding: 8px; border-radius: 5px; 
                       border: 1px solid #ccc; width: 120px;">
        </div>
                <div style="display: flex; align-items: center; margin-top: 10px; margin-left: -150px;">
                    <span style="margin-right: 5px; color: red;">*</span>           
                    <span style="margin-right: 5px; font-weight: bold;">VLAN&nbsp;&nbsp;</span>
                </div>
                        <div style="display: flex; align-items: center; margin-top: 10px; margin-left: 40px;">
    <span style="margin-right: 5px; color: red;">*</span>           
    <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Provider NGW</span>
    <input type="text" placeholder="Enter Gateway" 
           style="padding: 8px; border-radius: 5px; 
                  border: 1px solid #ccc; width: 120px;">
</div>

        <div style="margin-top: 10px;"></div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">VLAN ID</span>
        <input type="text" placeholder="Enter VLAN ID" 
            style="margin-top: 10px; padding: 8px; border-radius: 5px; 
                   border: 1px solid #ccc; width: 120px;">
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">BOND</span>
        <input type="checkbox" style="margin-top: 19px; width: 16px; height: 16px;">
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
        <span style="font-weight: bold;">INTERFACE</span>
        <div style="margin-top: 10px; ">
                <select id="interface-select-1" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                    <option value="" disabled selected>Select</option>
                    ${interfaces.map((iface) => `<option value="${iface}">${iface}</option>`).join('')}
                </select>
        </div>
            <div style="margin-top: 10px;">
                <select id="interface-select-1" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                    <option value="" disabled selected>Select</option>
                    ${interfaces.map((iface) => `<option value="${iface}">${iface}</option>`).join('')}
                </select>
            </div>
	    <div style="margin-top: 10px;">
                 <select id="interface-select-1" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                    <option value="" disabled selected>Select</option>
                    ${interfaces.map((iface) => `<option value="${iface}">${iface}</option>`).join('')}
                </select>
        </div>
             </div>
                </div>
            `,
            confirmButtonText: "BOOT",
            confirmButtonColor: "#28a745",
            preConfirm: () => {
                // Trigger the handleDeployClick function when "Deploy" is clicked
                handleDeployButtonClick();
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Trigger the next popup after clicking "BOOT"
                Swal.fire({
                    title: "Deployment",
                    width: "60%",
                    html: `
                        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; padding: 10px; margin-top: 20px;">
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div style="display: flex; align-items: center;">
                                    <span style="margin-left: 50px; font-weight: bold;">IP/CIDR</span>
                                </div>
                                <div style="display: flex; align-items: center; margin-top: 10px;">
                                    <span style="margin-right: 5px; color: red;">*</span>           
                                    <span style="margin-right: 10px; font-weight: bold;">IBN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <input type="text" id="ibn-input" placeholder="Enter IP/CIDR" 
                                        style="padding: 8px; border-radius: 5px; 
                                               border: 1px solid #ccc; width: 120px;">
                                </div>
                                <div style="display: flex; align-items: center; margin-top: 10px;">
                                    <span style="margin-right: 5px; color: red;">*</span>           
                                    <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Storage</span>
                                    <input type="text" id="storage-input" placeholder="Enter Storage" 
                                        style="padding: 8px; border-radius: 5px; 
                                               border: 1px solid #ccc; width: 120px;">
                                </div>
                                  <div style="display: flex; align-items: center; margin-top: 10px; margin-left: -150px;">
                                   <span style="margin-right: 5px; color: red;">*</span>           
                                     <span style="margin-right: 5px; font-weight: bold;">VLAN&nbsp;&nbsp;</span>
                                </div>
                                <div style="display: flex; align-items: center; margin-top: 10px;">
                                    <span style="margin-right: 5px; color: red;">*</span>           
                                    <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">DNS</span>
                                    <input type="text" id="dns" placeholder="Enter DNS" 
                                           style="padding: 8px; border-radius: 5px; 
                                                  border: 1px solid #ccc; width: 120px;">
                                </div>
                                <div style="display: flex; align-items: center; margin-top: 10px; margin-left: 40px;">
                                    <span style="margin-right: 5px; color: red;">*</span>           
                                    <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Provider NGW</span>
                                    <input type="text" id="gateway" placeholder="Enter Gateway" 
                                           style="padding: 8px; border-radius: 5px; 
                                                  border: 1px solid #ccc; width: 120px;">
                                </div>
                                <div style="display: flex; align-items: center; margin-top: 10px; margin-left: 0px;">
                                    <span style="margin-right: 5px; color: red;">*</span>           
                                    <span style="margin-right: 5px; font-weight: bold;">VIP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <input type="text" id="vip-input" placeholder="Enter VIP" 
                                        style="padding: 8px; border-radius: 5px; 
                                               border: 1px solid #ccc; width: 120px;">
                                </div>
                                <div style="display: flex; align-items: center; margin-top: 10px; margin-left: -12px;">
                                    <span style="margin-right: 5px; color: red;">*</span>           
                                    <span style="margin-right: 5px; font-weight: bold; margin-left: 0;">Services</span>
                                    <select id="services-select" style="padding: 8px; border-radius: 5px; 
                                               border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 31.5px">
                                        <option value="" disabled selected>Select</option>
                                        <option value="docker">docker</option>
                                        <option value="kubernetes">kubernetes</option>
                                        <option value="other">..</option>
                                    </select>
                                </div>
                                <div style="margin-top: 10px;"></div>
                            </div>
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <span style="font-weight: bold;">VLAN ID</span>
                                <input type="text" id="vlan-input" placeholder="Enter VLAN ID" 
                                    style="margin-top: 10px; padding: 8px; border-radius: 5px; 
                                           border: 1px solid #ccc; width: 120px;">
                            </div>
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <span style="font-weight: bold;">BOND</span>
                                <input type="checkbox" id="bond1" style="margin-top: 19px; width: 16px; height: 16px;">
                                <input type="checkbox" id="bond2" style="margin-top: 19px; width: 16px; height: 16px;">
                            </div>
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <span style="font-weight: bold;">INTERFACE</span>
                                <div style="margin-top: 10px;">
                <select id="interface-select-1" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                    <option value="" disabled selected>Select</option>
                    ${interfaces.map((iface) => `<option value="${iface}">${iface}</option>`).join('')}
                </select>
                        </div>
                        <div style="margin-top: 10px;">
                <select id="interface-select-3" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                    <option value="" disabled selected>Select</option>
                    ${interfaces.map((iface) => `<option value="${iface}">${iface}</option>`).join('')}
                </select>
                        </div>
                        <div style="margin-top: 10px;">
                <select id="interface-select-2" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc; width: 120px; font-size: 0.8rem; height: 32px">
                    <option value="" disabled selected>Select</option>
                    ${interfaces.map((iface) => `<option value="${iface}">${iface}</option>`).join('')}
                </select>
                                            </div>
                                        </div>
                                    </div>
                    `,
                    confirmButtonText: "DEPLOY",
                    confirmButtonColor: "#28a745",
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Collect all form data
                        const ibn = document.getElementById('ibn-input').value;
                        const storage = document.getElementById('storage-input').value;
                        const vip = document.getElementById('vip-input').value;
                        const service = document.getElementById('services-select').value;
                        const vlan = document.getElementById('vlan-input').value;
                        const gateway = document.getElementById('gateway').value;
                        const dns = document.getElementById('dns').value;
                        const selectedInterface1 = document.getElementById('interface-select-1').value;
                        const selectedInterface2 = document.getElementById('interface-select-2').value;
                        const selectedInterface3 = document.getElementById('interface-select-3').value;

                        // Collect checkbox values
                        const bond1 = document.getElementById('bond1').checked;
                        const bond2 = document.getElementById('bond2').checked;


                        // Create the form data object
                        const formData = {
                            IP_ADDRESS: ibn,
                            Storage: storage,
                            VIP: vip,
                            Service: service,
                            VLAN: vlan,
                            GATEWAY: gateway,
                            DNS_SERVERS: dns,
                            INTERFACE_01: selectedInterface1,
                            INTERFACE_02: selectedInterface2,
                            INTERFACE_03: selectedInterface3,
                            Bond1: bond1,
                            Bond2: bond2,
                        };
                        // Convert JSON object to string
                        const jsonString = JSON.stringify(formData, null, 2); // Pretty-print JSON

                        // Create a Blob from the JSON string
                        const blob = new Blob([jsonString], { type: 'application/json' });
                        const fileName = 'config.json'; // Change the file name to .json

                        // Create a FormData object to send to the backend
                        const formDataToSend = new FormData();
                        formDataToSend.append('file', blob, fileName);
                        formDataToSend.append('ibn', ibn); // Append ibn directly to FormData

                        // Send the FormData object to the backend (no need for headers with FormData)
                        fetch('http://192.168.249.101:9909/upload', {
                            method: 'POST',
                            body: formDataToSend, // This contains the file and any additional data
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Success:', data);
                                // Handle success on the backend
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Deployment Initialized',
                                    text: 'Your deployment request has been submitted successfully.',
                                });
                            })
                            .catch((error) => {
                                console.error('Error:', error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Deployment Failed',
                                    text: 'There was an error submitting your request.',
                                });
                            });

                        // Additional fetch request for deployment
                        fetch('http://192.168.249.101:8080/deploy', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                host: ibn, // Use the input value here
                                username: 'pinaka',
                                password: 'pinaka',
                                // scriptPath: '/home/pinaka/script.sh'
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                console.log(data);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                    }
                });

            }
        });
    };

    const paginatedNodes = selectedNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className={styles.header}>
                <button className={styles["back-button"]} onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} size="2x" />
                </button>
                <center>
                    <h1>Validation</h1>
                </center>
            </div>
            <div className={styles.main}>
                <div className={styles["data-table-container"]}>
                    <div className={styles.container}>
                        <div>
                            <table className={styles["data-table"]}>
                                <thead>
                                    <tr>
                                        <th>Sl No.</th>
                                        <th>IP Address</th>
                                        <th>Validate</th>
                                        <th>Status</th>
                                        <th>Result</th>
                                        <th>DEPLOY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedNodes.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className={styles["no-device-message"]}><center>No devices selected</center></td>
                                        </tr>
                                    ) : (
                                        paginatedNodes.map((node, index) => (
                                            <tr key={node.ip}>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td>{node.ip}</td>
                                                <td>
                                                    <button
                                                        disabled={validatingNode !== null && validatingNode.ip !== node.ip}
                                                        onClick={() => validateNode(node)}
                                                    >
                                                        {validatingNode !== null && validatingNode.ip === node.ip ? 'ReValidate' : 'Start'}
                                                    </button></td>
                                                <td style={{ color: 'red', fontFamily: 'Arial, sans-serif' }}>
                                                    {validationResults[node.ip] ? validationResults[node.ip].status : 'Not validated'}
                                                </td>
                                                <td>
                                                    {(validationResults[node.ip] || formSubmitted) ? (
                                                        <button
                                                            onClick={handleInfoButtonClick}
                                                            style={{
                                                                backgroundColor: validationResults[node.ip]?.status === 'Passed' ? '#28a745' : '#dc3545', // Green for 'Passed', Red for 'Failed'
                                                                color: 'white', // Text color to make it readable
                                                                cursor: 'pointer', // To indicate the button is clickable
                                                                border: 'none', // Optional: remove default border
                                                                padding: '8px 12px', // Optional: for better button padding
                                                                borderRadius: '4px' // Optional: to make the button corners rounded
                                                            }}
                                                        >
                                                            Info
                                                        </button>
                                                    ) : null}
                                                </td>
                                                <td className={styles["deploy-column"]}>
                                                    {validationResults[node.ip] && (
                                                        <button
                                                            className={styles["deploy-button"]}
                                                            disabled={
                                                                validationResults[node.ip].status !== "Passed"
                                                            } // Disable if not 'Passed'
                                                            title={
                                                                validationResults[node.ip].status !== "Passed"
                                                                    ? "Sorry, you can't deploy!"
                                                                    : undefined
                                                            } // Tooltip message when hovered
                                                            style={{
                                                                backgroundColor:
                                                                    validationResults[node.ip].status === "Passed"
                                                                        ? "#28a745"
                                                                        : "#dc3545", // Green for Passed, red for Failed
                                                                color: "white",
                                                                cursor:
                                                                    validationResults[node.ip].status === "Passed"
                                                                        ? "pointer"
                                                                        : "not-allowed",
                                                            }}
                                                            onClick={() => handleDeployClick(node.ip)} // Call handleDeployClick on button click
                                                        >
                                                            Deploy
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div className={styles.pagination}>
                                {Array.from({ length: Math.ceil(selectedNodes.length / itemsPerPage) }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={styles[currentPage === i + 1 ? 'active' : '']}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            {/* <button
                                className="next-button"
                                onClick={handleDeploy}
                                disabled={selectedRows.length === 0}
                            >
                                <strong>Next</strong>
                            </button> */}
                        </div>
                        <Sidebar />
                    </div>
                </div>
            </div>

            {/* BMC Form */}
            <div className={`${styles["bmc-form"]} ${bmcFormVisible ? styles.visible : ''}`}>
                <h2><strong>Enter BMC Details for {currentNode?.ip}</strong></h2>
                <form onSubmit={handleBmcFormSubmit}>
                    <label>
                        BMC IP Address:
                        <input
                            type="text"
                            value={bmcDetails.ip}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, ip: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        BMC Username:
                        <input
                            type="text"
                            value={bmcDetails.username}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, username: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        BMC Password:
                        <input
                            type="password"
                            value={bmcDetails.password}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, password: e.target.value })
                            }
                            required
                        />
                    </label>
                    <div>
                        <button type="submit">Submit</button>
                        <button type="button" className={styles["cancel-button"]} onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Validation;


