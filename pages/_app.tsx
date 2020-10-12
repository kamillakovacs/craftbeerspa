import "../styles/globals.scss";
import "react-datepicker/dist/react-datepicker.css";

import Main from "./components/main/main";

function App({ pageProps }) {
  return <Main {...pageProps} />;
}

export default App;