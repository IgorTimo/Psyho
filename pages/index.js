import 'semantic-ui-css/semantic.min.css'
import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Divider, Form, Input } from 'semantic-ui-react'
import provider from "../provider"
import tokenContract from "../tokenContract"
import { useRouter } from "next/router";
import { ethers } from "ethers"

const Index = (props) => {

  const [isMetamask, setIsMetamask] = useState()
  const [amount, setAmount] = useState()
  const [userBalance, setUserBalance] = useState(0)
  const [address, setAddress] = useState("");
  const [raised, setRaised] = useState(0)
  const [tokenName, setTokenName] = useState(props.tokenName)

  const router = useRouter();

  const handleConnectWalletClick = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }
      // let chainId = await ethereum.request({ method: "eth_chainId" });
      //
      // const bnbChainId = "0x38";
      //
      // if (chainId !== bnbChainId) {
      //   alert("You are not connected to BNB Smart Chain!");
      //   return;
      // }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);

      } catch (error) {
      console.log("Error connecting to metamask", error);
    }


  };

  useEffect(() => {
    if (provider.connection.url === 'metamask') {

      provider.send("eth_requestAccounts", []) // задаем текущий адрес
      .then((accounts) => {
        setAddress(accounts[0])
      })
      .catch((error) => console.log(error))

      const { provider: ethereum } = provider;
      ethereum.on('accountsChanged', (accounts) => {
        setAddress(accounts[0])
        setUserBalance(0)
        router.push("/");
      })
    }
  }, [])

  const checkHandler = async () => {
    await tokenContract.balanceOf(address)
    .then((bal) => setUserBalance(bal))
  }

  const handleBuySubmit = async (event) => {
    event.preventDefault()
  }

  return (

  <div style={{ marginTop: 15 }} className="ui centered cards">
    <div className="ui card" style={{ width: "400px" }}>
      <div className="content">Sale info</div>
      <div className="content">Raised: { raised }</div>
      <div className="content">Token name: { tokenName }</div>
      <div className="content" >
        <span>Your vPSH: { ethers.utils.formatEther(userBalance) }</span>
        <Button floated="right" size="tiny" onClick={ checkHandler }>Check</Button>
      </div>
      <div className="content">
        <Form style={{ marginLeft: 35 }} onSubmit={ handleBuySubmit }>
          <Input
            type="number"
            value={ amount }
            onChange={ (event) => setAmount(event.target.value) }
          />
          <Button primary style={{ marginLeft: "10px" }} type="submit">
            Buy vPSH
          </Button>
        </Form>
      </div>
      <div className="content">
      <Button
        positive={ !!address }
        primary
        onClick={ handleConnectWalletClick }
        style={{ width: "370px" }}>
        {!address ? "Connect to Wallet" : address}
      </Button>
      </div>
    </div>

  </div>
  )
}

export async function getServerSideProps(context) {

  let tokenName;
  await tokenContract.name()
  .then((data) => tokenName = data.toString())
  .catch((er) => tokenName = "some error")

  return {
    props: { tokenName }
  }
}

export default Index
