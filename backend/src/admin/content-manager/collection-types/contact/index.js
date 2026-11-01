export default {
    settings: {
      list: {
        fields: [
          { key: "name", label: "名前" },
          {
            key: "email",
            label: "メールアドレス",
            render: (email) => email ? `<a href="mailto:${email}" style="color: blue; text-decoration: underline;">${email}</a>` : "",
          },
          { key: "message", label: "メッセージ" },
        ],
      },
    },
  };
  