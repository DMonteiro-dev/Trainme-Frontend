import { Link } from 'react-router-dom';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Page } from '../../design-system/components/Page';
import { TextField } from '../../design-system/components/TextField';
import { theme } from '../../design-system/theme';

const PlaceholderPage = () => (
  <Page
    title="Personal training made simple"
    description="TrainMe is a modern platform that helps trainers manage clients, create plans, and keep everyone motivated."
  >
    <Card style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
      <Badge tone="success">Coming soon</Badge>
      <p style={{ margin: 0, color: theme.colors.textMuted }}>
        This is a placeholder for future public marketing pages. Use the button below to explore the in-app layout prototype.
      </p>

      <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
        <TextField
          label="Email"
          placeholder="trainer@trainme.app"
          type="email"
          style={{ flex: 1, minWidth: '220px' }}
        />
        <Button type="button">Join waitlist</Button>
      </div>

      <Link to="/app" style={{ alignSelf: 'flex-start' }}>
        <Button variant="secondary">Open app preview</Button>
      </Link>
    </Card>
  </Page>
);

export default PlaceholderPage;
