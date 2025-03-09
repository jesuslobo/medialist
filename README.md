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
        src="https://github.com/user-attachments/assets/4ac26cc9-fbf0-4fcd-8c05-2695fed5c924"
        width="100%"
    />
    <img
        src="https://github.com/user-attachments/assets/7c1da51e-07b9-4403-bc90-fa7abe8af981"
        width="24%"
    />
     <img
        src="https://github.com/user-attachments/assets/f6688787-cfe7-4d10-b35b-1f69329e1703"
        width="24%"
    />
     <img
        src="https://github.com/user-attachments/assets/7c99829e-ce03-4c2b-baa9-7d5579a39c4f"
        width="24%"
    />
     <img
        src="https://github.com/user-attachments/assets/68db0602-1685-48e2-b487-853a2db36850"
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
