const fs = require('fs');
const path = require('path');

const iconMapping = {
  'Users': 'IconUsers',
  'Heart': 'IconHeart',
  'Home': 'IconHome',
  'TrendingUp': 'IconTrendingUp',
  'Activity': 'IconActivity',
  'AlertTriangle': 'IconAlertTriangle',
  'Plus': 'IconPlus',
  'Search': 'IconSearch',
  'Pencil': 'IconPencil',
  'Trash2': 'IconTrash',
  'ArrowLeft': 'IconArrowLeft',
  'Calendar': 'IconCalendar',
  'User': 'IconUser',
  'BarChart3': 'IconChartBar',
  'LogOut': 'IconLogout',
  'ArrowRight': 'IconArrowRight',
  'ChevronDown': 'IconChevronDown',
  'ChevronRight': 'IconChevronRight',
  'MoreHorizontal': 'IconDots',
  'ChevronLeft': 'IconChevronLeft',
  'Check': 'IconCheck',
  'X': 'IconX',
  'Circle': 'IconCircle',
  'Minus': 'IconMinus',
  'GripVertical': 'IconGripVertical',
  'ChevronUp': 'IconChevronUp',
  'PanelLeft': 'IconLayoutSidebar',
  'LogIn': 'IconLogin',
  'Moon': 'IconMoon',
  'Sun': 'IconSun',
  'LayoutDashboard': 'IconLayoutDashboard'
};

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace imports
  if (content.includes('lucide-react')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g, (match, p1) => {
      const icons = p1.split(',').map(i => i.trim());
      const mapped = icons.map(i => iconMapping[i] || `Icon${i}`);
      return `import { ${mapped.join(', ')} } from '@tabler/icons-react'`;
    });
    changed = true;
  }

  // Replace usages in JSX/TSX
  for (const [lucide, tabler] of Object.entries(iconMapping)) {
    const regex = new RegExp(`<${lucide}(\\s|/|>)`, 'g');
    if (content.match(regex)) {
        content = content.replace(regex, `<${tabler}$1`);
        changed = true;
    }
    // Also handle self-closing tags and props if any
    const closingRegex = new RegExp(`</${lucide}>`, 'g');
    if (content.match(closingRegex)) {
        content = content.replace(closingRegex, `</${tabler}>`);
        changed = true;
    }
  }

  // Handle recharts placeholders
  if (content.includes('recharts')) {
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]recharts['"]/g, (match, p1) => {
          return `// Recharts disabled for migration: import { ${p1} } from 'recharts'`;
      });
      // Replace chart components with a div placeholder
      const chartComponents = ['BarChart', 'PieChart', 'LineChart', 'AreaChart', 'ResponsiveContainer', 'Bar', 'Pie', 'Line', 'Area', 'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip', 'Legend', 'Cell'];
      chartComponents.forEach(comp => {
          const regex = new RegExp(`<${comp}(\\s|/|>)`, 'g');
          if (content.match(regex)) {
              content = content.replace(regex, `<div data-chart-placeholder="${comp}"$1`);
              changed = true;
          }
          const closingRegex = new RegExp(`</${comp}>`, 'g');
          if (content.match(closingRegex)) {
              content = content.replace(closingRegex, `</div>`);
              changed = true;
          }
      });
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

walk(srcDir);
