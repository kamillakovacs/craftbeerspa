import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [data, setData] = useState({
    date: null,
    numberOfGuests: null,
    numberOfTubs: null,
    price: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    paymentMethod: "",
  });

  return <AppContext.Provider value={[data, setData]}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
