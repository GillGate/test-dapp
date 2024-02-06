import "./App.css";
import { TonConnectButton, useTonAddress } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { fromNano } from "ton-core";
import WebApp from "@twa-dev/sdk";

function App() {
  const {
    contract_address,
    contract_balance,
    counter_value,
    owner_address,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest,
  } = useMainContract();

  const { connected } = useTonConnect();

  const walletAddress = useTonAddress(false);

  const isOwner = walletAddress === owner_address?.toRawString() ? true : false;

  const showAlert = () => {
    WebApp.showAlert("Hey there!");
  };

  WebApp.expand();

  console.log(WebApp);

  const root = document.querySelector(":root");
  root.style.setProperty("--color-scheme", WebApp.colorScheme);

  return (
    <div className="App">
      <div className="App__connect">
        <TonConnectButton />
      </div>
      <div>
        {WebApp.platform !== "unknown" && (
          <div className="Card">
            <div>{WebApp.platform}</div>
            <button
              onClick={() => showAlert()}
              type="button"
              className="App__send"
            >
              Show alert
            </button>
          </div>
        )}
        <div className="Card">
          <b>Our contract Address</b>
          <div className="Hint">{contract_address}</div>

          {contract_balance && (
            <>
              <b>Our contract Balance</b>
              <div className="Hint">{fromNano(contract_balance)}</div>
            </>
          )}
        </div>

        <div className="Card">
          <b>Counter Value</b>
          <div>{counter_value ?? "Loading..."}</div>
        </div>

        {connected && (
          <>
            <div>
              <button
                onClick={() => sendIncrement()}
                type="button"
                className="App__send"
              >
                Send increment
              </button>

              <button
                onClick={() => sendDeposit()}
                type="button"
                className="App__send"
              >
                Send 1 TON
              </button>
            </div>

            {isOwner && (
              <button
                onClick={() => sendWithdrawalRequest()}
                type="button"
                className="App__withdraw"
              >
                Widthdraw 0.6 TON
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
