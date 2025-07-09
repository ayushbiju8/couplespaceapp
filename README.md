https://couplespace.onrender.com
http://192.168.185.153:8000/api/v1


logout
import { clearCoupleData } from "@/contexts/CoupleContext";

await AsyncStorage.removeItem("token");
await clearCoupleData();


refreshCouple()