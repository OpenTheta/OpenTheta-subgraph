import {FeeSplit, MarketItemCreated, MarketItemSale} from '../../generated/NFTMarket/NFTMarket'
import {MarketItem, OpenThetaMarket, User, NFTProject} from '../../generated/schema'
import {convertItemIdToString, convertTfuelToDecimal, MarketplaceV2_ADDRESS, ONE_BI, ZERO_BD, ZERO_BI} from './helpers'
import {BigInt} from "@graphprotocol/graph-ts";

export function handleMarketItemCreated(event: MarketItemCreated): void {

    let marketplace = OpenThetaMarket.load(MarketplaceV2_ADDRESS)
    if (marketplace == null) {
        marketplace = new OpenThetaMarket(MarketplaceV2_ADDRESS)
        marketplace.itemCount = ZERO_BI
        marketplace.totalVolumeTFUEL = ZERO_BD
        marketplace.totalNFTsSold = ZERO_BI
        marketplace.totalNFTsCanceled = ZERO_BI
        marketplace.totalFeeTFUEL = ZERO_BD
    }
    marketplace.itemCount = marketplace.itemCount.plus(ONE_BI)
    marketplace.save()

    let user = User.load(event.params.seller.toHexString())
    if (!user) {
        user = new User(event.params.seller.toHexString())
        user.totalEarnedTFUEL = ZERO_BD
        user.totalPayedTFUEL = ZERO_BD
        user.totalSoldNFTs = ZERO_BI
        user.currentListedNFTs = ZERO_BI
        user.totalBoughtNFTs = ZERO_BI
        user.address = event.params.seller
    }
    user.currentListedNFTs = user.currentListedNFTs.plus(ONE_BI)
    user.save()

    let marketItem = new MarketItem(convertItemIdToString(event.params.itemId))
    marketItem.itemId = event.params.itemId
    marketItem.contract = event.params.nftContract
    marketItem.tokenId = event.params.tokenId
    marketItem.seller = event.params.seller.toHexString()
    marketItem.buyer = event.params.owner.toHexString()
    marketItem.category = event.params.category
    marketItem.price = event.params.price
    marketItem.isSold = event.params.isSold
    marketItem.createdAtTimestamp = event.block.timestamp
    marketItem.createdAtBlockNumber = event.block.number
    marketItem.project = event.params.nftContract.toHexString()
    marketItem.save()

    let project = NFTProject.load(event.params.nftContract.toHexString())
    if (!project) {
        project = new NFTProject(event.params.nftContract.toHexString())
        project.totalVolumeTFUEL = ZERO_BD
        project.totalNFTsSold = ZERO_BI
        project.currentNFTsListed = ZERO_BI
        project.totalNFTsCanceled = ZERO_BI
        project.totalNFTs = ZERO_BI
    }
    project.currentNFTsListed = project.currentNFTsListed.plus(ONE_BI)
    project.totalNFTs = project.totalNFTs.plus(ONE_BI)
    project.save()
}

export function handleMarketItemSale(event: MarketItemSale): void {
    let marketplace = OpenThetaMarket.load(MarketplaceV2_ADDRESS)
    let marketItem = MarketItem.load(convertItemIdToString(event.params.itemId))
    let userSeller = User.load(event.params.seller.toHexString())
    let project = NFTProject.load(event.params.nftContract.toHexString())

    if(!marketplace || !marketItem || !userSeller || !project) return

    if(event.params.price == ZERO_BI){
        marketplace.totalNFTsCanceled = marketplace.totalNFTsCanceled.plus(ONE_BI)

        userSeller.currentListedNFTs = userSeller.currentListedNFTs.minus(ONE_BI)

        project.totalNFTsCanceled = project.totalNFTsCanceled.plus(ONE_BI)

    } else {
        marketplace.totalVolumeTFUEL = marketplace.totalVolumeTFUEL.plus(convertTfuelToDecimal(event.params.price))
        marketplace.totalNFTsSold = marketplace.totalNFTsSold.plus(ONE_BI)
        let fee = convertTfuelToDecimal(event.params.price).times(convertTfuelToDecimal(BigInt.fromString('40000000000000000')))
        marketplace.totalFeeTFUEL = marketplace.totalFeeTFUEL.plus(fee)

        userSeller.totalSoldNFTs = userSeller.totalSoldNFTs.plus(ONE_BI)
        userSeller.currentListedNFTs = userSeller.currentListedNFTs.minus(ONE_BI)
        userSeller.totalEarnedTFUEL = userSeller.totalEarnedTFUEL.plus(convertTfuelToDecimal(event.params.price).minus(fee))

        let userOwner = User.load(event.params.owner.toHexString())
        if(!userOwner) {
            userOwner = new User(event.params.owner.toHexString())
            userOwner.totalEarnedTFUEL = ZERO_BD
            userOwner.totalPayedTFUEL = ZERO_BD
            userOwner.totalSoldNFTs = ZERO_BI
            userOwner.currentListedNFTs = ZERO_BI
            userOwner.totalBoughtNFTs = ZERO_BI
            userOwner.address = event.params.owner
        }
        userOwner.totalBoughtNFTs = userOwner.totalBoughtNFTs.plus(ONE_BI)
        userOwner.totalPayedTFUEL = userOwner.totalPayedTFUEL.plus(convertTfuelToDecimal(event.params.price))
        userOwner.save()

        project.totalNFTsSold = project.totalNFTsSold.plus(ONE_BI)
        project.totalVolumeTFUEL = project.totalVolumeTFUEL.plus(convertTfuelToDecimal(event.params.price))
    }
    project.currentNFTsListed = project.currentNFTsListed.minus(ONE_BI)

    marketplace.save()
    userSeller.save()
    project.save()

    marketItem.buyer = event.params.owner.toHexString()
    marketItem.isSold = event.params.isSold
    marketItem.price = event.params.price
    marketItem.soldAtTimestamp = event.block.timestamp
    marketItem.soldAtBlockNumber = event.block.number
    marketItem.save()
}