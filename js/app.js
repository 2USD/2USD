App = {
     web3Provider: null,
     contracts: {},
     account: '0x0',
     loading: false,
     tokenPrice: 1000000000000000,
     tokensSold: 0,
     tokensAvailable: 750000,
   
    
   
     init: function() {
       console.log("App initialized...")
       return App.initWeb3();
     },
   
     initWeb3: async function() {
       if (typeof window.ethereum !== 'undefined') {
         App.web3Provider = window.ethereum; //checks for web3 and initiates it
         web3 = new Web3(window.ethereum);
         console.log('MetaMask is installed!');
         console.log(web3.version);
         
         try { //requesting account access TODO: move to dedicated button
           // Request account access
           
           const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
           const account = accounts[0];
           console.log(account);
         } catch (error) {
           // User denied account access...
           console.error("User denied account access")
         }
         console.log('Metamask is connected, address logged above');
         console.log(window.ethereum.networkVersion, 'window.ethereum.networkVersion');
         
       } else {
         // Specify default instance if no web3 instance provided
        
       }
   
       const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
           const account = accounts[0];
           //await web3.eth.getBalance(account).then(console.log);
        
        return App.initContracts();
     },
   
     initContracts: async function() {
       console.log('initializing contract');
       
       var abiArray = [{"inputs":[{"internalType":"uint256","name":"_price","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Sold","type":"event"},{"inputs":[],"name":"USDPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"numberOfTokens","type":"uint256"}],"name":"buyTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"endSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getLatestPrice","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenContract","outputs":[{"internalType":"contract IERC20Token","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokensSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
       console.log(web3);
       let mycontract =  new web3.eth.Contract(abiArray,'0x5901631D901Ca3cEe0D5036415c0683BEB6D76a0');
       console.log(mycontract);
       
       
     },
   
   
   
   
     // Listen for events emitted from the contract
     listenForEvents: function() {
       App.contracts.DappTokenSale.deployed().then(function(instance) {
         instance.Sell({}, {
           fromBlock: 0,
           toBlock: 'latest',
         }).watch(function(error, event) {
           console.log("event triggered", event);
           App.render();
         })
       })
     },
   
     render: function() {
       if (App.loading) {
         return;
       }
       App.loading = true;
   
       var loader  = $('#loader');
       var content = $('#content');
   
       loader.show();
       content.hide();
   
       // Load account data
       web3.eth.getCoinbase(function(err, account) {
         if(err === null) {
           App.account = account;
           $('#accountAddress').html("Your Account: " + account);
         }
       })
   
       // Load token sale contract
       App.contracts.DappTokenSale.deployed().then(function(instance) {
         dappTokenSaleInstance = instance;
         return dappTokenSaleInstance.tokenPrice();
       }).then(function(tokenPrice) {
         App.tokenPrice = tokenPrice;
         $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
         return dappTokenSaleInstance.tokensSold();
       }).then(function(tokensSold) {
         App.tokensSold = tokensSold.toNumber();
         $('.tokens-sold').html(App.tokensSold);
         $('.tokens-available').html(App.tokensAvailable);
   
         var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
         $('#progress').css('width', progressPercent + '%');
   
         // Load token contract
         App.contracts.DappToken.deployed().then(function(instance) {
           dappTokenInstance = instance;
           return dappTokenInstance.balanceOf(App.account);
         }).then(function(balance) {
           $('.dapp-balance').html(balance.toNumber());
           App.loading = false;
           loader.hide();
           content.show();
         })
       });
     },
   
     buyTokens: function() {
       try {
         $('#content').hide();
         $('#loader').show();
         var numberOfTokens = $('#numberOfTokens').val();
         App.contracts.DappTokenSale.deployed().then(function(instance) {
           return instance.buyTokens(numberOfTokens, {
             from: App.account,
             value: numberOfTokens * App.tokenPrice,
             gas: 500000 // Gas limit
           });
         }).then(function(result) {
           console.log("Tokens bought...")
           $('form').trigger('reset') // reset number of tokens in form
           // Wait for Sell event
         });
       } catch (error) {
         console.log("purchase rejected");
         $('form').trigger('reset')
       }
      
     }
   }
   
   $(function() {
     $(window).load(function() {
       App.init();
     })
   });
   