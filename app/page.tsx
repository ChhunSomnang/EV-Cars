import BrandList from "./components/BrandList";
import SpecialOffers from "./components/Promotion";
import ListProduct from "./components/ListProduct";

export default function Home() {
  return (
    <div className="">
      <div className="text-2xl flex mx-4 md:mx-10 lg:mx-24 xl:mx-72 my-10">
        Welcome to Store24, the biggest online market in Cambodia
      </div>

      <div className="flex items-center justify-center my-14 text-5xl font-normal">
        Browse by brand
      </div>

      <BrandList />
      <div className="flex items-center justify-center my-14 text-5xl font-normal">
        Popular car
      </div>
      <ListProduct />
      <div className="mx-72">
        <div className="">{/*<Menu />*/}</div>
      </div>
    </div>
  );
}
