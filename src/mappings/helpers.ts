/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, Address, ethereum } from '@graphprotocol/graph-ts'

class TicketMetadata {
    maxTickets: BigInt;
    ticketPrice: BigInt;
    ticketStartTime: BigInt;
    ticketEndTime: BigInt;
    acceptDonations: boolean;
}

class EventMetadata {
    timeStart: BigInt;
    timeEnd: BigInt;
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const MarketplaceV2_ADDRESS = '0x059377c014cfc12dd2612ebfe9cfd1a6fc1a8883'

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
        bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}

export function bigDecimalExp18(): BigDecimal {
    return BigDecimal.fromString('1000000000000000000')
}

export function convertTfuelToDecimal(eth: BigInt): BigDecimal {
    return eth.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(18)))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == ZERO_BI) {
        return tokenAmount.toBigDecimal()
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function convertItemIdToString(eventId: BigInt): string {
    return eventId.toHexString().slice(2).padStart(40, '0')
}

export function equalToZero(value: BigDecimal): boolean {
    const formattedVal = parseFloat(value.toString())
    const zero = parseFloat(ZERO_BD.toString())
    if (zero == formattedVal) {
        return true
    }
    return false
}

export function isNullTfuelValue(value: string): boolean {
    return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}