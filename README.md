<div align="center">
    <img
        src="./docs/assets/logo_with_bg.svg"
        width="120"
        height="120"
    >
    <h1 style="font-weight: 700"> MediaList</h1>
    <p>
        MediaList is a self-hosted home for collectors and enthusiasts, where every item page is fully customizable to create the perfect media collection.
    </p>
</div>

<div>
    <img
        src="https://github.com/user-attachments/assets/ff5f9d3c-6887-4876-992d-3b276e2bfe53"
        width="100%"
    />
    <img
        src="https://github.com/user-attachments/assets/dcf193aa-4a09-4906-b662-0d5de469220d"
        width="24%"
    />
     <img
        src="https://github.com/user-attachments/assets/5bafc3fe-fe9e-454f-a8ab-210c2e4f5faf"
        width="24%"
    />
     <img
        src="https://github.com/user-attachments/assets/fa915e00-1b65-44a7-9b29-38a3621acadd"
        width="24%"
    />
     <img
        src="https://github.com/user-attachments/assets/0be9748a-12ea-4ae4-afbc-81241de21128"
        width="24%"
    />
</div>

## Installation
You can install it directly from Docker by running: 
``` bash
docker run --name medialist -p 3000:3000 -e PORT=3000 -e DATABASE_PATH=db/sqlite.db -v medialist:/app/public/users -v medialist:/app/db khalidibnwalid/medialist
```
For more details, see [Installation Guide](https://github.com/khalidibnwalid/medialist/wiki/Installation)

## Contribution
You can contribute by reporting bugs or suggesting new features through issues.

If you're a developer looking to get involved, check out the [Contributing Guide](./docs/CONTRIBUTING.md).
