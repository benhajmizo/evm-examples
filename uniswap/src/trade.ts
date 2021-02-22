import { Contract, BigNumber } from "ethers";
import UniswapFactory from "../artifacts/UniswapV2Factory.json";
import UniswapRouter from "../artifacts/UniswapV2Router02.json";
import IERC20 from "../artifacts/IERC20.json";
import setup from "./setup"

const ROUTER_ADDRESS = "0x16704f5E329c86c8C31fEf2d363d795D6CAc5d01";

const ACA = "0x0000000000000000000000000000000001000000";
const DOT = "0x0000000000000000000000000000000001000002";

const dollar = BigNumber.from('1000000000000000000');

const main = async () => {
    const { wallet, provider } = await setup();
    const deployerAddress = await wallet.getAddress();
    const tokenACA = new Contract(ACA, IERC20.abi, wallet);
    const tokenDOT = new Contract(DOT, IERC20.abi, wallet);
    
    const router = new Contract(ROUTER_ADDRESS, UniswapRouter.abi, wallet);
    const factory = new Contract(await router.factory(), UniswapFactory.abi, wallet);
    
    // approve
    await tokenACA.approve(router.address, dollar.mul(100));
    await tokenDOT.approve(router.address, dollar.mul(100));

    // before
    const acaAmountBefore = await tokenACA.balanceOf(deployerAddress);
    const dotAmountBefore = await tokenDOT.balanceOf(deployerAddress);

    console.log({
        acaAmountBefore: acaAmountBefore.toString(),
        dotAmountBefore: dotAmountBefore.toString(),
    });

    // trade

    const path = [DOT, ACA];
    const buyAmount = dollar;

    console.log('Trade', {
        path,
        buyAmount: buyAmount.toString(),
    })
    
    await router.swapExactTokensForTokens(buyAmount, 0, path, deployerAddress, 10000000000);

    // check
    const tradingPairAddress = await factory.getPair(ACA, DOT);
    const tradingPair = new Contract(tradingPairAddress, IERC20.abi, wallet);
    const lpTokenAmount = await tradingPair.balanceOf(deployerAddress);
    const lpAcaAmount = await tokenACA.balanceOf(tradingPairAddress);
    const lpDotAmount = await tokenDOT.balanceOf(tradingPairAddress);
    const acaAmountAfter = await tokenACA.balanceOf(deployerAddress);
    const dotAmountAfter = await tokenDOT.balanceOf(deployerAddress);
    
    console.log({
        tradingPair: tradingPairAddress,
        lpTokenAmount: lpTokenAmount.toString(),
        liquidityPoolAcaAmount: lpAcaAmount.toString(),
        liquidityPoolDotAmount: lpDotAmount.toString(),
        acaAmountAfter: acaAmountAfter.toString(),
        dotAmountAfter: dotAmountAfter.toString(),
    });

    provider.api.disconnect();
}

main()
