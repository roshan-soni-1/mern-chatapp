import { useChatStore } from "../store/useChatStore";
import {useEffect} from "react"
import {useAuthStore} from "../store/useAuthStore.js"

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import CheckEmail from "../components/CheckEmail.jsx"

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className={`flex items-center justify-center ${!selectedUser ?  "pt-20": "pt-0"} px-0`}>
{/*        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">*/}
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-screen">
          <div className="flex h-full rounded-lg overflow-hidden">
            

            {!selectedUser ?  <Sidebar />: <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
