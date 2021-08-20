# terraform-plan-slack-action

This GitHub action creates a slack message with a summary of changes from `terraform plan`.

## Usage

### Simple

```yaml
jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: hashicorp/setup-terraform@v1
      - run: terraform init
      - run: terraform plan
        id: plan
      - uses: terraform-plan-slack-action@master
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          plan: ${{ steps.plan.outputs.stdout }}
```

### Monorepo

```yaml
jobs:
  modules:
    runs-on: ubuntu-latest
    steps:
      - uses: theappnest/terraform-monorepo-action@v1
        id: modules
    outputs:
      modules: ${{ steps.modules.outputs.modules }}

  terraform:
    runs-on: ubuntu-latest
    needs: modules
    strategy:
      matrix:
        module: ${{ fromJson(needs.modules.outputs.modules) }}
    defaults:
      run:
        working-directory: ${{ matrix.module }}
    steps:
      - uses: actions/checkout@v2
      - uses: hashicorp/setup-terraform@v1
      - run: terraform init
      - run: terraform plan
        id: plan
      - uses: theappnest/create-artifact-action@v1
        with:
          name: terraform-plan
          path: ${{ matrix.module }}
          content: ${{ steps.plan.outputs.stdout }}

  comment:
    runs-on: ubuntu-latest
    needs: terraform
    steps:
      - uses: theappnest/terraform-plan-slack-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Inputs

> NOTE: Defaults to getting plan from artifact if neither `path` nor `plan` are specified.

- `webhook-url` Slack webhook URL.
- `channel` Slack channel.
- `name` (optional) The name of the artifact containing the output of `terraform plan`. Defaults to `terraform-plan`.
- `path` (optional) A path glob to check for `terraform plan` output files.
- `plan` (optional) The output of `terraform plan`.
