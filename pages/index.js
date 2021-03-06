import { doWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import ProductPage, { loadRequestData } from 'pages/cs/all_case/index';

export async function getServerSideProps(ctx) {
  return await doWithLoggedInUser(ctx, (ctx) => {
    return loadRequestData(ctx);
  });
}

export default function CSIndexPage(props) {
  return ProductPage(props);
}
