import { parseBody } from 'next/dist/next-server/server/api-utils';
import { APIStatus } from '@thuocsi/nextjs-components/lib/common';
import Head from 'next/head';
import { Box, Button, Paper, TextField } from '@material-ui/core';
import styles from './login.module.css';

/*
Login page that is used on stg/uat/prd is only run from internal-hrm code repo.
'Login.js' file of other repos is only used for local testing.

This file have 2 ways to use:
+ GET method: display login page with login form
+ POST method: receive submitted login data (username/password)
*/
export async function getServerSideProps({ req, query, res }) {
  const returnObject = { props: {} };
  if (req && req.method === 'POST') {
    // read form data
    const body = await parseBody(req, '1kb');

    const { username, password } = body;
    // call backend API
    const response = await fetch(`${process.env.API_HOST}/core/account/v1/authentication`, {
      method: 'POST',
      contentType: 'application/json',
      body: JSON.stringify({
        username,
        password,
        type: 'EMPLOYEE',
      }),
      headers: {
        'User-Agent': req.headers['user-agent'],
        'X-Forwarded-For': req.headers['x-forwarded-for'],
      },
    });
    const result = await response.json();

    // if OK, do set cookie & redirect page to relative target
    if (result.status === APIStatus.OK) {
      const data = result.data[0];
      const url = body.url || '/';
      res.setHeader('set-cookie', `session_token=${data.bearerToken}; Path=/; HttpOnly`);
      res.setHeader('location', url);
      res.statusCode = 302;
      res.end();
    }

    returnObject.props.url = body.url;
  } else {
    returnObject.props.url = query.url || '/';
  }
  return returnObject;
}

/*
A simple login page.
Can customize to display more.
LoginForm has basic inputs of authentication flow:
+ Login label
+ Username / password input
+ Submit button
*/
export default function LoginPage({ url }) {
  return (
    <div>
      <Head>
        <title>Đăng nhập vào hệ thống nội bộ</title>
      </Head>
      <Paper className={styles.loginForm}>
        <h1>Đăng nhập</h1>
        <form method="POST" action="/login">
          <input type="hidden" name="url" value={url} />
          <Box>
            <TextField
              id="username"
              label="Tên tài khoản"
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              style={{ margin: 12, width: 280 }}
              autoFocus
              name="username"
            />
          </Box>
          <Box>
            <TextField
              id="password"
              label="Mật khẩu"
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              style={{ margin: 12, width: 280 }}
              name="password"
              type="password"
            />
          </Box>
          <Box>
            <Button type="submit" variant="contained" color="primary" style={{ margin: 8 }}>
              Đăng nhập
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  );
}
