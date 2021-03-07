import { doWithLoggedInUser } from '@thuocsi/nextjs-components/lib/login';
import ProductPage, { loadRequestData } from 'pages/cs/all-case';

export async function getServerSideProps(ctx) {
  const res = await doWithLoggedInUser(ctx, (cbCtx) => loadRequestData(cbCtx));

  return res;
}

export default function CSIndexPage(props) {
  return ProductPage(props);
}
