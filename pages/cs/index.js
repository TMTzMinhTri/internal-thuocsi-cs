export function getServerSideProps() {
  return {
    redirect: {
      destination: '/cs/all-case',
      permanent: true,
    },
  };
}

const CSPage = () => {};

export default CSPage;
