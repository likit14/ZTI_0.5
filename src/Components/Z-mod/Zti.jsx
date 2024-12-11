import React from "react";
import Layout1 from "../layout";
import { theme, Layout, Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { CloudTwoTone } from "@ant-design/icons";

const style = {
  background: '#fff',
  padding: '36px 20px',
  marginTop: '19px',
  marginRight: '25px',
  borderRadius: '10px',
  cursor: 'pointer',
  boxShadow: '10px',
};

const { Content } = Layout;

export default function Zti({ children }) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/newcloud"); // replace with your actual path
  };

  const handleRedirectAddNode = () => {
    navigate("/addnodes"); // replace with your actual path
  };

  const handleRedirectRemoveNode = () => {
    navigate("/removenodes"); // replace with your actual path
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout1>
      <Row
        gutter={16} // Added gutter for spacing
        justify="space-between" // Ensures equal spacing between the columns
        style={{ marginLeft: "20px" }} // Added marginLeft to shift everything a bit to the right
      >
        <Col
          className="gutter-row"
          span={7} // Each column takes up 7 spans, so 3 columns will total 21 spans
          onClick={handleRedirect}
          style={style}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="data:image/png;base64,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" alt="cloud--v1" style={{ width: "60px", height: "60px",  marginLeft: "30px" }}></img>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "500",
                marginLeft: "30px",
              }}
            >
              New Cloud
            </span>
          </div>
        </Col>

        <Col
          className="gutter-row"
          span={7} // Each column takes up 7 spans
          onClick={handleRedirectAddNode}
          style={style}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAHuUlEQVR4nO1daYwURRQuLg8wIrtTNbu4alS88MQTz5h4G0UTRQF/qotoPJbdedWDxlEjYoxHJLJITDTxQBODP5CYEMMPbxM0KmqMEYyKRhQEDQqowGdezyws68x0dU9PX1NfUskms1396r2uV+/sFsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwiJuTMWIPOF0RZgpCQuVxjuK8LUkrJOErYqwQxE2Ko21ivCu0nheEWbnCjh3wu3YO27y04lujFIFTFEaz0qN9UoDgQZhsyS8phxMP6SEfeJeVuIxTmOs1Ci4T3NQptcemyTh0fYCxse9zsRhYgl7SUJREf5oAuP3GFJjm9R4jIUd97oTAengYtbpzWZ8FUH8kiNcJ1oWJYyUhMejZnwVQbwkS9hPtBI6ipCSsCJu5g8Swirl4DDRCujUOFgS1sTNdFVFJak+nCCyjHwvDpUa3wVk0kq2YvKEaR1FTMzNQadrWpYwcqyDcXnCsaqAq6XGg64/wP6BXyEQNkiNE0UWoYrI+2W+JKxTGvfIPhzu936yDx2S0Bdgt/3U0YtDROYcK8JbxkwgbGRvtrOE0Q3fu4SRSuMmpfGzD8F/Hsq9kwKp8YSPxS9l9dKkg3+pj4fgOZE2uHrYQbfS6Fcab1fs+98NF7xDEe5qLoUYJjVmsTNmKIirRNLBloMizG/gcAUH1aTGNZHR7OBCjhMZ0La2rYT9RRKRL+AKSXg/KNMHP/mScG3U9LMQJOFvz4dD4wGRJHBoWBI+bJjxu0dPjGu50eAB2ZzvhRJxo6sH+1ZCB9tDZP6yuNclNV402AX3xUoku+lK45MQGc9jU9scHBjrwoQQ4x20S8KvHmfUOo7YxkKg1DinknEKk/mQBdwqEgKpcZsnzQVMiZwwRbhIavwZOvM1VnGqUSQEnLr0SgJx1DRSoiThLKmxJQCDVyuNBZwGzGlM4i3OnjAvsnM2cqzOOEwgEgalca/ng0PYoAhf8dklCXOlg0v5bAydmJyDI92bmTN9uyQsZqGJFEdplcbOgD7My6wt2NFrmBCOMCrCp8ZEEJa3F3CUyACUn3VXHx+zf9QYERpPGurxLYpws8gQZEgZOqnxOu8o3wS0F3CqSRydzTb+X5ExKAfTQzQ0fvMZS3IDVR8YMb+Io0UGkS/iuLAEUBl8pvSa3VzjShO1k8Unf4g5GqanP/DQ3i+8UCnr8zpwM6Xzq0ERvglbADxyhDtELbC9bsD85aIFoDTmcO6ZveMc4bIOwjH5Xoxxd0cR+bzG+dKBVhrv+TJbCf+qAi6oelO+occE27NiaoZ9ZrD/YyoIjim5julQeLrhhMWhUp4x5DTOk4QfDIXwwh4X85NtcFFqPdyIo6omCaqdHQ5O23VhJYdb74LVobjYLYB8L8YYCWHweVpJoNe7YEGsq0oZOHvGnrCHQ7uTi8vcCzxrNB1Mj3tRaQQXd3GVXq2gJpfquP8oNb6ta79qTIp7MWnG2DtxgCI8PDS0LzW+d1V7JWZRUwBVzSaLYOFuwvIh/D1eeJVmxJYLzSQwjI0eSfirchjPtAKIATkHp7hdnhpPC6/Ml1VBTa00WWAP4WqYihHKwZkcF1IaSyThy0plyD/uIGyUGl9UfuPmwsmihOHCJ1z1btAqNEO0CMbdjYPYYlGEH03CCkMGh3PmtRG6fN3UwBHrFxlHR7l0fZFJrahB2Ibn6DdW3XwSe0y4JsuhCKUxw8sUDyiIDXkH1xuVoHhOVsTZImvoxihJeCZsxlcRxELu0qlLi1coleteRIbQWcJopfFGs5k/aCyr2/JkkpDhzJDISr+ajpT5u4RQcye4XS7eW+lNkQHICNROIIPGKCnv4BaRYqgCbvDLNM85fc5X8/0UOQeXG+yCrdwhI9Jqamr/1o7XvH7n4/cfdfWgLXhhlsb6NJ4HkrAoiNrwmjeQKiI8VXWyXAEnmxQmsRDyDs4QKfJwZUAny2vuIHNym2zN7iDTpupKWfYskQIoDi8EeVKbtQPK46GqE7oFSISPjKVJWLErv5nUwBoFiu00VQDse9UM4PHLMXw1aJR7fV/hfrKkhS1UOaqJBO4A1DVoWMcH6Q/jHDMnGtjk48QDB6XizKqpckg5kQKQGk4sTXqhjkKNesvdDFrSCIMbhQf9r3pOUNkJwd/d2eQhHUyoR38lcZJIAbjdoj7SZyvjZraqMrjsox7tXs5XWIwOKID1xhOxdeQG7bjMOgGMVwMM7MaoenR72f8iXgFs8z2h7MNJRnEjK4DmCGAAknCJ+1Imq4KiUUF1G9sIjzTywibVwMgVcETmD2FTsEXCfWRc78L5A+634kMwjGS3alUzNO1QSXbEHGiRdSjC5KQKYI9OmcyihOGm/VtRCsAtTw9QTZdKKI15iRMAYa5oFbQRulKTkMkqlHcJZnQ7gDBftBq6etDm9XK+KATAeZaWLfnPE6YlQACRv6Q2UZDlb5EhltGKqud/mIoR7rfFImY+9w57Fum2CjrLxbnLImM+YWlT3q6YapTcDzv0R6J27JNfG1yr2YyUK38UqOUPXD8mKpcL+viwQz11wx8Ync8fFjImwKIM9k65Yi1I7IhjO/xuCPutShECShjufidBw+GYPSdOBvIa7uC/NT5zf3Og3ahmwMDaf6DQ4NO8pk/bAAAAAElFTkSuQmCC" alt="add-to-loud" style={{ width: "60px", height: "60px",  marginLeft: "30px" }}></img>

            <span
              style={{
                fontSize: "18px",
                fontWeight: "500",
                marginLeft: "30px",
              }}
            >
              Add Nodes
            </span>
          </div>
        </Col>

        <Col
          className="gutter-row"
          span={7} // Each column takes up 7 spans
          onClick={handleRedirectRemoveNode}
          style={style}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAHpUlEQVR4nO1deYhVVRg/bi0amTPvnDdjU1LZZqutthK0R1lQltqf1ZhFyzjzvnOfRa8iM6KFJMckKGixIOwPlUDCP9oDi8qKiDRKi6yZtLDUSv3Fd+fNOA7vvXvunfvu9s4PPhh4c+/9zved5VvvFcLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwiJuzMCoPOEsRZgjCUuUxnuK8K0kbJaEHYqwWxG2KI1NivC+0nhJEeblCrhg8l3YP27204l2jFEFTFcaL0iNHqWBQETYJglvKgezJpVwQNzDSjwmaIyXGgV3NgcVenXaKglPNBcwMe5xJg5TSthPEoqK8GcdBL8PSY2dUuNJVnbc404EpIPLeE+vt+ArKOLXHOFG0bAoYbQkPBW14Cso4lVZwkGikdBShJSENXELf5AS1ikHR4pGQKvG4ZKwIW6hqwpbkurCySLLyHfiCKnxQ0AhrWUrJk+Y2VLElNx8tLqmZQmjxzuYkCecoAq4Tmo84voD7B/4VQKhV2qcIrIIVUTer/AlYbPSuF924Si/z5NdaJGErgCr7eeWTkwSmXOsCO8YC4Gwhb3Z1hLGDvvZJYxWGrcqjV98KP7LUJ6dFEiNp30MfgVvL3U6+Ff4mAQvirTB3YcdtCuNbqXxbtm+/8NwwLsV4d76cogRUmMuO2OGirhWJB1sOSjComEcruCgmtS4PjKeHVzCcSID3jY1lXCwSCLyBVwtCR8GFfrgmS8JN0TNPytBEv7xnBwaD4skgUPDkvDxsAW/lzpiHMstBhNkW74TSsSNtg4cWA4d7ApR+KviHpfUeMVgFTwYK5PspiuNz0IUPNPWpvk4NNaBCSEmOmiWhN88zqjNHLGNhUGpcX454xSm8CELuEMkBFLjTk+eC5geOWOKcKnU+Ct04Wus41SjSAg4demVBOKoaaRMScK5UmN7AAGvVxqLOQ2Y05jKS5w9YR5k6zzkeDvjMIFIGJTGA54Th9CrCN/w2SUJC6SDK/hsDJ2ZnINj3IeZC32XJCxjpYkUR2mVxp6APsxrvFuwozdsRjjCqAifGzNBWN1cwLEiA1B+xl2ZPmX/aHhMaDxjuI9vV4TbRIYgQ8rQSY2VvKJ8M9BcwBkmcXQ22/h/RcagHMwK0dD43WcsyQ1UfWQk/CKOExlEvogTw1JAmfhM6TR7uMY1JttOFmf+EHM0TE+/f9I+JLxQLuvzOnAztedXgiJ8F7YCmHKEu0U1sL1uIPzVogGgNOZz7pm94xzhyhbC8flOjHNXRxH5vMZF0oFWGh/4MlsJ/6kCLq74UH6gxw12ZcXUDPvMYP/HVBEcU3Id06HwdMMJy0LlPGPIaVwoCRsNlfDyPhfzzDa4KLUebsRRVZME1Z4WB2cOXFjO4da6YH0oLnYDIN+JcUZKGHyelhPotS5YHOuoUgbOnrEn7OHQ7uHiMvcCzxpNB7PiHlQawcVdXKVXLajJpTruP0qN72varxpT4x5MmjH+HhyiCI8NDe1LjR/drb0cs6iqgIpmk0WwcDdh9RD5niS8SjNiy4VmEhjBRo8k/F0+jOdYBcSAnIPT3S5PjeeEV+bLbkF1rTRZbA/hSpiBUcrBORwXUhrLJeHrcmXIvy4RtkiNr8q/cXPhNFHCSOET7vZu0Co0WzQIJtyHw9hiUYSfTMIKQ4jDOQubCG2+HmrgiHWLjKOlr3R9qUmtqEHYhu/Rbbx180nsccMNWQ5FKI3ZXqZ4QEX05h3cZFSC4nmzIs4TWUM7xkjC82ELvoIilnCXTk1evEKpXPciMoTWEsYqjbfqLfxBtKpmy5NJQoYzQyIr/Wo6UuEPKKHqSnC7XLyX0tsiA5ARbDuBDBqjpLyD20WKoQq4OUbhu1T1/RQ5B1cZrIId3CEj0mpq6vCtHb/E7z9q60BT8MIsjZ40ngeSsDRu4Q8Q4dmKTOYKOM2kMImVkHdwtkiRhytDcLJCXAU7q3YHmTZVl8uy54oUQHF4IQGCH0KPVmTWLUAifGKsTcKagfxmUgNrFCi2U99VQNhYNYDHL8fw1aDR1+v7OveTJS1sofqimkgi1TRoeI8P0h/GOWZONLDJx4kHDkrFmVVTfSHl2IVdRVZOLE16oVKhSr3lXgUsr3V92Aqv8Pxa/L/heYPySuhJ7CxyMLkW/+XESSIV4HaL+kifrY1b2KoCcdlHLd69nK+wBB1QAT3GN2LryA3acZl1AgSv+gXYjjG1+Pay/0W8Ctjp+4ayC6caxY2sAuqjgH5IwuXuS5nsFhTNFlSzsY3w+HBe2KSGQbkCjs78IWwKtki4j4zrXTh/wP1WfAjWNQ5TyLgZmnaoJDtiDrTIOhRhWtyCrkb7dMpkFiWMNO3finT2c3l6gGq6VEJpLEycAggLRKOgidCWmoRMVqG8SzCjI8Ii0Who60CT18v5Itp6ehu25D9PmJkABUT+ktpEQfZ9i8xuPbFhBka53xaL/uBd6Vmk2yho7SvOXRXhtrOiLm9XTDVK7ocduiOxeOzMrw6u1axHypU/CtTwB64fE5XLBX182KHWdsMfGF3EHxYyZsCiD+ydcsVakNgRx3b43RD2W5UiBJQw0v1OgobDMXtOnPTnNVzivzW+cH9zoN2oZsDA2v8LfiZx8eMfrgAAAABJRU5ErkJggg==" alt="remove-from-cloud" style={{ width: "60px", height: "60px", marginLeft: "30px" }}></img>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "500",
                marginLeft: "30px",
              }}
            >
              Remove Nodes
            </span>
          </div>
        </Col>
      </Row>

      <Content style={{ margin: "16px 16px" }}>
        <div
          style={{
            padding: 30,
            minHeight: "auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </Content>
    </Layout1>
  );
}
