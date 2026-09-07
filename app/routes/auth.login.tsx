import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { AppProvider, Page, Card, TextField, Button, Box, Text } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { useState } from "react";
import { login } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = login(request);
  return json({ errors });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = await login(request);
  return json({ errors });
};

export default function AuthLogin() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const errors = actionData?.errors || loaderData?.errors;

  return (
    <AppProvider i18n={{}}>
      <Page>
        <Box paddingBlockStart="1000">
          <Card>
            <Form method="post">
              <Box padding="400">
                <Text as="h2" variant="headingLg">
                  Log in to Smart COD
                </Text>
                <Box paddingBlockStart="400">
                  <TextField
                    type="text"
                    name="shop"
                    label="Shop domain"
                    helpText="e.g. fab-gadget-5ssd1kdj.myshopify.com"
                    value={shop}
                    onChange={setShop}
                    autoComplete="on"
                    error={errors?.shop}
                  />
                </Box>
                <Box paddingBlockStart="400">
                  <Button submit variant="primary">
                    Log in
                  </Button>
                </Box>
              </Box>
            </Form>
          </Card>
        </Box>
      </Page>
    </AppProvider>
  );
}
