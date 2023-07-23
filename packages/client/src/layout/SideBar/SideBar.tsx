import s from './SideBar.module.scss';
import { Button } from '@components/buttons/Button/Button.js';
import { Icon } from '@components/buttons/Icon/Icon.js';
import cx from 'classnames';
import { useLocalStorage } from 'usehooks-ts';

export const SideBar = () => {
  const [expanded, toggleExpanded] = useLocalStorage('sidebar-expanded', true);

  return (
    <aside className={cx(s.sidebar, expanded && s.expanded)}>
      <Button
        transparent
        class={cx(s.expander, expanded && s.expanded)}
        onClick={() => toggleExpanded(!expanded)}
        nopad
      >
        <Icon type="ChevronDoubleRight" variant="outline" size="sm" />
      </Button>
      {expanded ? <Button class="flex items-center gap-2 py-1" transparent></Button> : null}
    </aside>
  );
};
