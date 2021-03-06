import App from '@thuocsi/nextjs-components/app/app';

export default function AppCS({ children, select, breadcrumb }) {
  return (
    <App select={select} breadcrumb={breadcrumb}>
      {children}
    </App>
  );
}
