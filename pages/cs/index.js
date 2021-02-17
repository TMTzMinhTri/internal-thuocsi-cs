export function getServerSideProps() {
    return {
        redirect: {
            destination: '/cs/all_case',
            permanent: true,
        }
    }
}

const CSPage = () => {}

export default CSPage;