import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { FamilyPage } from './pages/FamilyPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { AskPage } from './pages/AskPage';
import { AnswerPage } from './pages/AnswerPage';
import { ChatPage } from './pages/ChatPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { FindFamilyPage } from './pages/FindFamilyPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/family" component={FamilyPage} />
      <Route path="/questions" component={QuestionsPage} />
      <Route path="/ask" component={AskPage} />
      <Route path="/answer/:memoryId" component={AnswerPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/chat/:memoryId" component={ChatPage} />
      <Route path="/memories" component={MemoriesPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/find-family" component={FindFamilyPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
