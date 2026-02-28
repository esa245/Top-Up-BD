async function test() {
  const body = new URLSearchParams();
  body.append("key", "418d90ab70f631b605e282072620ae6f");
  body.append("action", "services");

  const response = await fetch("https://motherpanel.com/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString(),
  });
  const text = await response.text();
  console.log(text.substring(0, 500));
}
test();
