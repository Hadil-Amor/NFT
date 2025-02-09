import { useState, useEffect } from 'react'

import { Row, Col, Card, Button } from 'react-bootstrap'
import Web3 from 'web3';
import MARKETPLACEconfiguration from '../contracts/Marketplace.json';
import NFTconfiguration from '../contracts/NFT.json';
const Home = () => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const web3 = new Web3(window.ethereum);
    const MARKETPLACE_ADDRESS ="0x8Fa3bCE4D250A9Ec2050F9f2C13AD9d98c8B840C";
    const MARKETPLACE_ABI = MARKETPLACEconfiguration.abi;
    const MARKETPLACEContract = new web3.eth.Contract(MARKETPLACE_ABI, MARKETPLACE_ADDRESS);
    
    const NFT_ADDRESS ="0x6Dbb3355AD4b7C26e7cDbdD86509EE3e0b4A8AC1";
    const NFT_ABI = NFTconfiguration.abi;
    const NFTContract = new web3.eth.Contract(NFT_ABI, NFT_ADDRESS);
  const loadMarketplaceItems = async () => {

    
    // Load all unsold items
    const itemCount = await  MARKETPLACEContract.methods.itemCount().call();
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      
      const item = await  MARKETPLACEContract.methods.items(i).call();
      if (!item.sold) {
        
        // get uri url from nft contract
        const uri = await NFTContract.methods.tokenURI(item.tokenId).call();
        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of item (item price + fee)
        const totalPrice = await  MARKETPLACEContract.methods.getTotalPrice(item.itemId).call();
        console.log(totalPrice)
        // Add item to items array
        items.push({
          totalprice:totalPrice ,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        })
        console.log(items)
      }
    }
    setLoading(false)
    setItems(items)
  }

  const buyMarketItem = async (item) => {
    await (await  MARKETPLACEContract.methods.purchaseItem(item.itemId, { value: item.totalprice }).send({ from: '0xb0EB7d58BD9892ad8A8bE898035BfDc2f66d4443' })).wait()
    loadMarketplaceItems()
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                      Buy for {item.totalprice.toString()} wei
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default Home