import { join } from 'path'
import * as core from '@actions/core'
import { context } from '@actions/github'
import { download } from './download'
import { Fields, parsePlan, parsePlanDir } from './parsePlan'
import { postMessage } from './slack'

async function run(): Promise<void> {
  try {
    const webhookUrl = core.getInput('webhook-url', { required: true })
    const channel = core.getInput('channel', { required: true })
    const name = core.getInput('name')
    const path = core.getInput('path')
    const plan = core.getInput('plan')

    if (!name && !path && !plan) {
      throw new Error('Either `name`, `path` or `plan` must be set.')
    }

    let fields: Fields = []

    if (path) {
      fields = parsePlanDir(path)
    } else if (plan) {
      const value = parsePlan(plan)
      if (value) {
        fields = [{ title: context.repo.repo, value }]
      }
    } else {
      const dir = await download(name)
      fields = parsePlanDir(join(dir, '**'), dir)
    }

    if (fields.length) {
      const changes = JSON.stringify(fields, null, 2)
      core.info(`Detected changes to infrastructure: ${changes}`)
      await postMessage(webhookUrl, channel, fields)
    } else {
      core.info('No infrastructure changes detected.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
