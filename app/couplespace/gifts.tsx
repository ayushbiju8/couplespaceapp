import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";

const allProducts = [
  {
    id: 1,
    name: "Nilu's Collection 925 Sterling Silver Plated Adjustable Couple Ring",
    category: "Jewelry",
    price: "₹292",
    oldPrice: "₹1295",
    image: require("../../assets/Gifts/img1.jpg"),
    link: "https://amzn.to/3FzvcUH",
  },
  {
    id: 2,
    name: "AQUASTREET Reversible Heart Pendant Necklace",
    category: "Jewelry",
    price: "₹699",
    oldPrice: "₹1299",
    image: require("../../assets/Gifts/img2.jpg"),
    link: "https://amzn.to/4klHMGl",
  },
  {
    id: 3,
    name: "HighSpark 925 Silver Stylish Love Knot Heart Pendant",
    category: "Jewelry",
    price: "₹1799",
    oldPrice: "₹4997",
    image: require("../../assets/Gifts/img3.jpg"),
    link: "https://amzn.to/3Z6ktYw",
  },
  {
    id: 4,
    name: "Artistic Gifts Customized 3D LED Heart Lamp",
    category: "Home Decor",
    price: "₹959",
    oldPrice: "₹1799",
    image: require("../../assets/Gifts/img4.jpg"),
    link: "https://amzn.to/4klTQaD",
  },
  {
    id: 5,
    name: "eCraftIndia Romantic Couple Statue Showpiece",
    category: "Home Decor",
    price: "₹379",
    oldPrice: "₹799",
    image: require("../../assets/Gifts/img5.jpg"),
    link: "https://amzn.to/43p0jLR",
  },
  {
    id: 6,
    name: "Chocoloony Chocolate Basket Gift Hamper (20 pcs)",
    category: "Food",
    price: "₹298",
    oldPrice: "₹699",
    image: require("../../assets/Gifts/img6.jpg"),
    link: "https://amzn.to/3Hj6atw",
  },
  {
    id: 7,
    name: "SMOOR Premium Celebration Chocolate Box (300g)",
    category: "Food",
    price: "₹664",
    oldPrice: "₹749",
    image: require("../../assets/Gifts/img7.jpg"),
    link: "https://amzn.to/3Hjbq0h",
  },
  {
    id: 8,
    name: "TIED RIBBONS Preserved Red Rose Gift Box (Silver Necklace)",
    category: "Gift",
    price: "₹2899",
    oldPrice: "₹599",
    image: require("../../assets/Gifts/img8.jpg"),
    link: "https://amzn.to/3Hj6kkC",
  },
  {
    id: 9,
    name: "HighSpark 925 Silver Solitaire Heart Pendant with Chain",
    category: "Jewelry",
    price: "₹1499",
    oldPrice: "₹3497",
    image: require("../../assets/Gifts/img9.jpg"),
    link: "https://amzn.to/446GUzp",
  },
  {
    id: 10,
    name: "GRECIILOOKS Textured Oversized Cotton T-Shirt for Men",
    category: "Clothing",
    price: "₹399",
    oldPrice: "₹1999",
    image: require("../../assets/Gifts/img10.jpg"),
    link: "https://amzn.to/45Jvent",
  },
  {
    id: 11,
    name: "Fastrack Analog Black Dial Women's Casual Watch",
    category: "Watch",
    price: "₹1295",
    oldPrice: "₹1995",
    image: require("../../assets/Gifts/img11.jpg"),
    link: "https://amzn.to/4kA8zPf",
  },
  {
    id: 12,
    name: "GUESS Analog Pink Dial Watch with White Band",
    category: "Watch",
    price: "₹7996",
    oldPrice: "₹9995",
    image: require("../../assets/Gifts/img12.jpg"),
    link: "https://amzn.to/45NI0kW",
  },
  {
    id: 13,
    name: "Daniel Klein Analog Rose Gold Dial Women's Watch",
    category: "Watch",
    price: "Currently not in stock",
    oldPrice: "₹---",
    image: require("../../assets/Gifts/img13.jpg"),
    link: "https://amzn.to/43TfrQI",
  },
  {
    id: 14,
    name: "Carlton London Brixton Women Gift Set (Watch + Bracelet)",
    category: "Watch",
    price: "₹4300",
    oldPrice: "₹6790",
    image: require("../../assets/Gifts/img14.jpg"),
    link: "https://amzn.to/3ZlJwH9",
  },
  {
    id: 15,
    name: "RIZIK STORE® Metal Abstract Deer Wall Art (Pack of 3)",
    category: "Home Decor",
    price: "₹999",
    oldPrice: "₹2999",
    image: require("../../assets/Gifts/img15.jpg"),
    link: "https://amzn.to/3HqYtBF",
  },
  {
    id: 16,
    name: "Dekorly Artificial Potted Plants (8 Pack)",
    category: "Home Decor",
    price: "₹288",
    oldPrice: "₹999",
    image: require("../../assets/Gifts/img16.jpg"),
    link: "https://amzn.to/4dU5qqZ",
  },
  {
    id: 17,
    name: "Ancient Shoppee Wooden Glass Tube Planter",
    category: "Home Decor",
    price: "₹139",
    oldPrice: "₹299",
    image: require("../../assets/Gifts/img17.jpg"),
    link: "https://amzn.to/4kAqrJM",
  },
  {
    id: 18,
    name: "GLUN Magic 3D LED Night Lamp with Sensor",
    category: "Home Decor",
    price: "₹118",
    oldPrice: "₹599",
    image: require("../../assets/Gifts/img18.jpg"),
    link: "https://amzn.to/3ZowEjs",
  },
  {
    id: 19,
    name: "Webelkart Premium Wooden Key Holder (7 Hook)",
    category: "Home Decor",
    price: "₹189",
    oldPrice: "₹999",
    image: require("../../assets/Gifts/img19.jpg"),
    link: "https://amzn.to/445Rqa9",
  },
  {
    id: 20,
    name: "Urbano Fashion Baggy Fit Panelled Jeans for Men",
    category: "Clothing",
    price: "₹999",
    oldPrice: "₹2299",
    image: require("../../assets/Gifts/img20.jpg"),
    link: "https://amzn.to/3Tf6tIo",
  },
  {
    id: 21,
    name: "Cadbury Dairy Milk Silk Chocolate Bar, 150g (3 Pack)",
    category: "Food",
    price: "₹430",
    oldPrice: "₹525",
    image: require("../../assets/Gifts/img21.jpg"),
    link: "https://amzn.to/4ky8RGr",
  },
  {
    id: 22,
    name: "Ferrero Rocher Premium Milk Chocolate (300g) - 24 Pcs",
    category: "Food",
    price: "₹740",
    oldPrice: "₹950",
    image: require("../../assets/Gifts/img22.jpg"),
    link: "https://amzn.to/4jHrPJq",
  },
  {
    id: 23,
    name: "Chokola Sweet Love Heart Shaped Dark Chocolates Box",
    category: "Food",
    price: "₹725",
    oldPrice: "₹899",
    image: require("../../assets/Gifts/img23.jpg"),
    link: "https://amzn.to/43NDCji",
  },
  {
    id: 24,
    name: "Lindt LINDOR Assorted Chocolate Truffles, 200g",
    category: "Food",
    price: "₹729",
    oldPrice: "₹899",
    image: require("../../assets/Gifts/img24.jpg"),
    link: "https://amzn.to/4kAqLrY",
  },
  {
    id: 25,
    name: "4700BC Gourmet Popcorn Combo Box (325g)",
    category: "Food",
    price: "₹664",
    oldPrice: "₹699",
    image: require("../../assets/Gifts/img25.jpg"),
    link: "https://amzn.to/3SHF3dZ",
  },
  {
    id: 26,
    name: "Dalmond Truffles Handmade Almond Date Chocolates",
    category: "Food",
    price: "₹499",
    oldPrice: "₹645",
    image: require("../../assets/Gifts/img26.jpg"),
    link: "https://amzn.to/3FPiotn",
  },
];

export default function Gifts() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = allProducts.filter((product) =>
    (product.name + " " + product.category)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <View className="flex-1 bg-pink-50 p-4">
      <View className="mb-4">
        <Text className="text-3xl font-bold text-pink-700 text-center mb-4">
          Perfect Gifts for Your Partner 💝
        </Text>
        <TextInput
          className="bg-white rounded-lg px-4 py-2 border border-pink-300 mb-6 text-pink-700"
          placeholder="Search gifts like chocolate, lamp..."
          placeholderTextColor="#d46a8c"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredProducts.length === 0 ? (
        <Text className="text-center text-pink-600 mt-20 text-lg">
          No results found.
        </Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openLink(item.link)}
              className="flex-1 m-1 bg-white rounded-xl overflow-hidden shadow-md"
            >
              <Image
                source={item.image}
                resizeMode="cover"
                className="w-full h-40"
              />
              <Text
                numberOfLines={2}
                className="text-sm font-semibold text-pink-900 px-2 mt-2"
              >
                {item.name}
              </Text>
              <Text className="text-xs text-pink-600 px-2">{item.category}</Text>
              <View className="flex-row items-center px-2 mb-3">
                {item.oldPrice && (
                  <Text className="text-xs text-pink-400 line-through mr-2">
                    {item.oldPrice}
                  </Text>
                )}
                <Text className="text-sm font-bold text-pink-800">{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
