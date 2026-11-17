import type { BuiltinComponentType, ComponentDefinition } from '@klnp/contracts';

export interface ComponentMeta extends ComponentDefinition {
  type: BuiltinComponentType;
  iconName: string;
}

export const BUILTIN_COMPONENTS: ComponentMeta[] = [
  // Layout components
  {
    componentId: 'builtin.container',
    type: 'container',
    version: '1.0.0',
    displayName: 'Container',
    category: 'layout',
    description: 'Flexible box container for grouping and layout',
    iconName: 'ViewQuiltRounded',
    defaultGeometry: { width: 300, height: 200 },
    defaultStyle: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
      borderRadius: 8,
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16,
    },
    defaultProperties: {},
  },
  {
    componentId: 'builtin.group',
    type: 'group',
    version: '1.0.0',
    displayName: 'Group',
    category: 'layout',
    description: 'Logical grouping container without visual borders',
    iconName: 'FolderOutlined',
    defaultGeometry: { width: 250, height: 150 },
    defaultStyle: {},
    defaultProperties: {},
  },
  {
    componentId: 'builtin.spacer',
    type: 'spacer',
    version: '1.0.0',
    displayName: 'Spacer',
    category: 'layout',
    description: 'Empty spacing element for responsive layouts',
    iconName: 'HeightRounded',
    defaultGeometry: { width: 100, height: 24 },
    defaultStyle: {},
    defaultProperties: {},
  },
  {
    componentId: 'builtin.divider',
    type: 'divider',
    version: '1.0.0',
    displayName: 'Divider',
    category: 'layout',
    description: 'Horizontal or vertical visual separator line',
    iconName: 'HorizontalRuleRounded',
    defaultGeometry: { width: 280, height: 2 },
    defaultStyle: {
      backgroundColor: '#e2e8f0',
    },
    defaultProperties: {
      orientation: 'horizontal',
    },
  },

  // Basic / Content
  {
    componentId: 'builtin.text',
    type: 'text',
    version: '1.0.0',
    displayName: 'Text',
    category: 'basic',
    description: 'Typography element for headings and paragraphs',
    iconName: 'TextFieldsRounded',
    defaultGeometry: { width: 180, height: 36 },
    defaultStyle: {
      color: '#1e293b',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    defaultProperties: {
      text: 'Heading or text content',
    },
  },
  {
    componentId: 'builtin.button',
    type: 'button',
    version: '1.0.0',
    displayName: 'Button',
    category: 'action',
    description: 'Interactive clickable button element',
    iconName: 'SmartButtonRounded',
    defaultGeometry: { width: 140, height: 42 },
    defaultStyle: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    defaultProperties: {
      label: 'Click me',
      variant: 'contained',
    },
  },
  {
    componentId: 'builtin.image',
    type: 'image',
    version: '1.0.0',
    displayName: 'Image',
    category: 'media',
    description: 'Visual image element with fit and aspect ratio',
    iconName: 'ImageRounded',
    defaultGeometry: { width: 240, height: 160 },
    defaultStyle: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    defaultProperties: {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop',
      alt: 'Image placeholder',
      fit: 'cover',
    },
  },
  {
    componentId: 'builtin.icon',
    type: 'icon',
    version: '1.0.0',
    displayName: 'Icon',
    category: 'basic',
    description: 'Material symbol or icon element',
    iconName: 'StarOutlineRounded',
    defaultGeometry: { width: 32, height: 32 },
    defaultStyle: {
      color: '#2563eb',
    },
    defaultProperties: {
      name: 'star',
      size: 24,
    },
  },

  // Input elements
  {
    componentId: 'builtin.input',
    type: 'input',
    version: '1.0.0',
    displayName: 'Input Field',
    category: 'input',
    description: 'Single-line text input field',
    iconName: 'InputRounded',
    defaultGeometry: { width: 260, height: 44 },
    defaultStyle: {
      backgroundColor: '#f8fafc',
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderStyle: 'solid',
      borderRadius: 8,
      paddingLeft: 12,
      paddingRight: 12,
      fontSize: 14,
      color: '#1e293b',
    },
    defaultProperties: {
      placeholder: 'Enter text here...',
      inputType: 'text',
    },
  },
  {
    componentId: 'builtin.checkbox',
    type: 'checkbox',
    version: '1.0.0',
    displayName: 'Checkbox',
    category: 'input',
    description: 'Boolean selection checkbox with label',
    iconName: 'CheckBoxOutlined',
    defaultGeometry: { width: 160, height: 32 },
    defaultStyle: {
      fontSize: 14,
      color: '#334155',
    },
    defaultProperties: {
      label: 'Checkbox option',
      checked: false,
    },
  },
  {
    componentId: 'builtin.switch',
    type: 'switch',
    version: '1.0.0',
    displayName: 'Switch',
    category: 'input',
    description: 'Toggle switch for on/off states',
    iconName: 'ToggleOnRounded',
    defaultGeometry: { width: 140, height: 32 },
    defaultStyle: {
      fontSize: 14,
      color: '#334155',
    },
    defaultProperties: {
      label: 'Enable feature',
      checked: false,
    },
  },

  // Data / List
  {
    componentId: 'builtin.list',
    type: 'list',
    version: '1.0.0',
    displayName: 'List',
    category: 'data',
    description: 'Vertical scrollable repeating data list',
    iconName: 'FormatListBulletedRounded',
    defaultGeometry: { width: 300, height: 220 },
    defaultStyle: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
      borderRadius: 8,
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8,
    },
    defaultProperties: {
      itemCount: 3,
    },
  },
];

export const COMPONENT_MAP = new Map<string, ComponentMeta>(
  BUILTIN_COMPONENTS.map((c) => [c.type, c])
);

