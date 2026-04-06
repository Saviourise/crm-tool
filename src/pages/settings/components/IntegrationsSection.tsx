/**
 * Initial release: the integration catalog (“Connect your favorite tools to streamline your workflow”)
 * and “Webhook Endpoints” UI are not rendered. Implementation was removed from this file to avoid
 * calling list/webhook APIs for disabled UI; restore from git history when re-enabling — see
 * `docs/initial_release_disabled_features.md` §8.
 */
import { FirefliesIntegrationCard } from './FirefliesIntegrationCard'

export function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <FirefliesIntegrationCard />

      {/* Connect your favorite tools to streamline your workflow is disabled for initial release */}

      {/* Webhook Endpoints is disabled for initial release */}
    </div>
  )
}
