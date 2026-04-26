# Content

Fonte única de verdade dos espaços de cliente do portal Bionic Brand OS.

## Estrutura

```
content/
└── clients/
    └── <slug>/
        ├── manifest.json          Meta do cliente (nome, slug, essência, tema)
        ├── brand-system.json      Sistema de marca estruturado
        ├── brand-system.md        Documento de marca narrativo
        ├── design-tokens.json     Tokens de design (cores, tipografia, espaçamento)
        ├── design-system.md       Design system narrativo
        ├── brand-prompt.md        Prompt destilado para IAs
        └── brand-agent-master.md  System prompt operacional do Brand Agent
```

## Sync

Os arquivos deste diretório são sincronizados a partir da pasta canônica `/Users/renanlopesumpierre/Projetos/TAG/Brandbook/`. Para atualizar:

```bash
cd /Users/renanlopesumpierre/Projetos/TAG
cp Brandbook/brand-system.md          bionic-brand-os/content/clients/betina-weber/brand-system.md
cp Brandbook/brand-system.json        bionic-brand-os/content/clients/betina-weber/brand-system.json
cp Brandbook/betina-weber-design-system.md bionic-brand-os/content/clients/betina-weber/design-system.md
cp Brandbook/betina-weber-tokens.json bionic-brand-os/content/clients/betina-weber/design-tokens.json
cp Brandbook/brand-prompt.md          bionic-brand-os/content/clients/betina-weber/brand-prompt.md
cp Brandbook/betina-brand-prompt-master.md bionic-brand-os/content/clients/betina-weber/brand-agent-master.md
```

Na v2 este sync vira hook de git ou CMS externo. No piloto, manual.
