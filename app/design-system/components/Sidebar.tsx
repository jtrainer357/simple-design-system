"use client";

import { cn } from "@/design-system/lib/utils";

interface NavItem {
  id: string;
  label: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { id: "overview", label: "Overview" },
  {
    id: "tokens",
    label: "Design Tokens",
    children: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "spacing", label: "Spacing" },
      { id: "shadows", label: "Shadows" },
      { id: "border-radius", label: "Border Radius" },
    ],
  },
  {
    id: "components",
    label: "Components",
    children: [
      { id: "button", label: "Button" },
      { id: "card", label: "Card" },
      { id: "input", label: "Input" },
      { id: "label", label: "Label" },
      { id: "textarea", label: "Textarea" },
      { id: "select", label: "Select" },
      { id: "checkbox", label: "Checkbox" },
      { id: "radio-group", label: "Radio Group" },
      { id: "switch", label: "Switch" },
      { id: "slider", label: "Slider" },
      { id: "avatar", label: "Avatar" },
      { id: "badge", label: "Badge" },
      { id: "alert", label: "Alert" },
      { id: "alert-dialog", label: "Alert Dialog" },
      { id: "dialog", label: "Dialog" },
      { id: "sheet", label: "Sheet" },
      { id: "popover", label: "Popover" },
      { id: "tooltip", label: "Tooltip" },
      { id: "dropdown-menu", label: "Dropdown Menu" },
      { id: "context-menu", label: "Context Menu" },
      { id: "navigation-menu", label: "Navigation Menu" },
      { id: "menubar", label: "Menubar" },
      { id: "tabs", label: "Tabs" },
      { id: "filter-tabs", label: "Filter Tabs" },
      { id: "underline-tabs", label: "Underline Tabs" },
      { id: "accordion", label: "Accordion" },
      { id: "collapsible", label: "Collapsible" },
      { id: "table", label: "Table" },
      { id: "progress", label: "Progress" },
      { id: "skeleton", label: "Skeleton" },
      { id: "toast", label: "Toast" },
      { id: "separator", label: "Separator" },
      { id: "breadcrumb", label: "Breadcrumb" },
      { id: "pagination", label: "Pagination" },
      { id: "calendar", label: "Calendar" },
      { id: "command", label: "Command" },
      { id: "hover-card", label: "Hover Card" },
      { id: "scroll-area", label: "Scroll Area" },
      { id: "aspect-ratio", label: "Aspect Ratio" },
      { id: "form", label: "Form" },
    ],
  },
  {
    id: "dashboard-components",
    label: "Dashboard Components",
    children: [
      { id: "card-wrapper", label: "CardWrapper" },
      { id: "priority-action", label: "PriorityAction" },
      { id: "ai-action-card", label: "AIActionCard" },
      { id: "action-row-card", label: "ActionRowCard" },
      { id: "schedule-row-card", label: "ScheduleRowCard" },
      { id: "message-row-card", label: "MessageRowCard" },
      { id: "outstanding-card", label: "OutstandingCard" },
    ],
  },
  { id: "usage-guidelines", label: "Usage Guidelines" },
];

interface SidebarProps {
  searchQuery?: string;
}

export function Sidebar({ searchQuery = "" }: SidebarProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filterNavigation = (items: NavItem[], query: string): NavItem[] => {
    if (!query) return items;

    return items.reduce<NavItem[]>((acc, item) => {
      const matchesQuery = item.label.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = item.children ? filterNavigation(item.children, query) : undefined;

      if (matchesQuery || (filteredChildren && filteredChildren.length > 0)) {
        acc.push({
          ...item,
          children: filteredChildren,
        });
      }

      return acc;
    }, []);
  };

  const filteredNavigation = filterNavigation(navigation, searchQuery);

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={(e) => handleClick(e, item.id)}
          className={cn(
            "block rounded-md px-3 py-1.5 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            depth === 0 && "font-medium",
            depth > 0 && "text-muted-foreground ml-4"
          )}
        >
          {item.label}
        </a>
        {hasChildren && (
          <div className="mt-1">
            {item.children!.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-1">
      <h1 className="mb-6 text-xl font-light text-black">Design System</h1>
      {filteredNavigation.map((item) => renderNavItem(item))}
    </nav>
  );
}
