// Traces to: L2-006
import { describeNamedCrud } from './content-crud.js';

describeNamedCrud({ label: 'architecture', route: '/api/architecture', field: 'name', table: 'architectures' }, 'L2-006');
