package handlers

import (
	"github.com/gin-gonic/gin"
)

const (
	rpcAddr    = "https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org:443"
	chainId    = "greenfield_5600-1"
	privateKey = ""
)

func HandleUpload(c *gin.Context) {
	// account, err := types.NewAccountFromPrivateKey("test", privateKey)
	// if err != nil {
	// 	log.Fatalf("New account from private key error, %v", err)
	// }
	// cli, err := client.New(chainId, rpcAddr, client.Option{DefaultAccount: account})
	// if err != nil {
	// 	log.Fatalf("unable to new greenfield client, %v", err)
	// }
	// ctx := context.Background()
	// nodeInfo, versionInfo, err := cli.GetNodeInfo(ctx)
	// if err != nil {
	// 	log.Fatalf("unable to get node info, %v", err)
	// }
	// log.Printf("nodeInfo moniker: %s, go version: %s", nodeInfo.Moniker, versionInfo.GoVersion)
	// height, err := cli.GetLatestBlockHeight(ctx)
	// if err != nil {
	// 	log.Fatalf("unable to get latest block height, %v", err)
	// }
	// log.Printf("Current block height: %d", height)
}
