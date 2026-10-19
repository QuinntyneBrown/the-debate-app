// Traces to: L2-005
import { describeNamedCrud } from './content-crud.js';

describeNamedCrud({ label: 'article', route: '/api/article', field: 'title', table: 'articles' }, 'L2-005');
