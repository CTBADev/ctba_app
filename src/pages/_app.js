import "../scss/.base/bootstrap-grid.min.css";
import "../styles/globals.scss";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
