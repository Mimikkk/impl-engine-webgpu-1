import { create } from '@zd/engine';
import { Footer, Header, Content, SideBar } from '@layout/layout.js';
import s from './App.module.scss';

export const App = () => {
  console.log(create);

  return (
    <div className={s.app}>
      <SideBar />
      <Header />
      <Content />
      <Footer />
    </div>
  );
};
