import Head from "next/head";
import "../styles/globals.css";
import { store } from "../data/store";
import { Provider } from "react-redux";
import pluralise from "pluralize";

// TODO: Better place for global generic things to go?
pluralise.addSingularRule(/Fuses$/i, "Fuse"); // Spear-Fuses -> Spear-Fuse
pluralise.addSingularRule(/Axes$/i, "Axe"); // Axes -> Axe

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>OPR Army Forge Beta</title>
        <meta name="description" content="OPR Army Forge List Builder" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@600&&family=Source+Sans+Pro:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
}

MyApp.getInitialProps = async (ctx) => {
  //console.log("Force disable pre-rendering?");
  return {};
};

export default MyApp;
