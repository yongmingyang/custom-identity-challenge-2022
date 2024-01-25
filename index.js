// dev wallet: Bsnb32s3iGJjbUyVYTnrsLPz3qkRKMrVNiyovChGHz1V
// eth wallet: 0x0090Cd3e5C7805643920a1e6492334Bb2752374F
const fs = require('fs')
const ethers = require('ethers')
const keypairPath = '/Users/mingyang/.config/solana/id.json'
const web3 = require('@solana/web3.js')
const keypairbuff = new Uint8Array(fs.readFileSync(keypairPath).toJSON().data.slice(0, 32))
const authority = web3.Keypair.fromSeed(keypairbuff)
const publicKey = authority.publicKey
console.log(publicKey.toBase58())
const DidSol = require('@identity.com/sol-did-client')
const DidSolIdentifier = DidSol.DidSolIdentifier
const DidSolService = DidSol.DidSolService
const ethAddress = Buffer.from('0090Cd3e5C7805643920a1e6492334Bb2752374F', 'hex')
const ethAddr = ethers.utils.arrayify(ethAddress)


// const authority = new web3.PublicKey('Bsnb32s3iGJjbUyVYTnrsLPz3qkRKMrVNiyovChGHz1V')
// const authority = web3.Keypair.generate();
const connection = new web3.Connection("https://api.devnet.solana.com")
const cluster = 'devnet'

const buildService = async () => { 
    // await connection.requestAirdrop(authority.publicKey, 2*web3.LAMPORTS_PER_SOL)
    // const bal = await connection.getBalance(authority.publicKey)
    // console.log(bal)
    const didSolIdentifier = DidSolIdentifier.create(publicKey, cluster);
    const service = await DidSolService.build(didSolIdentifier);
    console.log("service built")
    const addVerInstr = await service.addVerificationMethod({
      fragment: 'eth-address',
      keyData: Buffer.from(ethAddr),
      methodType: DidSol.VerificationMethodType.EcdsaSecp256k1RecoveryMethod2020,
      flags: [DidSol.BitwiseVerificationMethodFlag.CapabilityInvocation],
    }, publicKey).withAutomaticAlloc(publicKey).withSolWallet(publicKey).instructions()


    //sign instr
    let tx = new web3.Transaction()
    tx.feePayer = publicKey
    tx.add(...addVerInstr)
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    
    const response = await web3.sendAndConfirmTransaction(connection, tx, [authority])
    console.log(response)

    // console.log(addVerResult, "service verification method added")
    // await service.addService({
    //     fragment: 'service-1',
    //     serviceType: "profile-pic",
    //     serviceEndpoint: "https://tenor.com/view/vendetta-hats-off-fat-gif-11654529"
    // }).withSolWallet(authority).rpc()
    // console.log(
    //     "service added",
    // )
    const didDoc = await service.resolve();
    console.log(JSON.stringify(didDoc, null, 2));
    // console.log(service)
    // service.
}

async function signTransactions (
    // to break into signing and sending transaction signature to backend api
    instructions,
    signers,
    payer
  ) {
    let tx = new Transaction()
    tx.feePayer = payer || this.wallet.publicKey
    tx.add(...instructions)
    tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash
    if (signers?.length > 0) {
      await tx.sign(...signers)
      return tx
    } else {
      tx = await this.wallet.signTransaction(tx)
      return tx
    }
}

buildService()

