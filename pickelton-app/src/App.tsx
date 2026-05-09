import React, { useState } from "react";
import { Screen, Sport } from "./types";
import { TopAppBar, BottomNavBar } from "./components/Navigation";
import { GROUPS, COURTS, MATCHES } from "./data";
import { GroupCard } from "./components/GroupCard";
import { CourtCard } from "./components/CourtCard";
import { Badge, Button, SectionHeader } from "./components/UI";
import { cn } from "./lib/utils";

// --- Screens ---

const CreateClub1: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="max-w-xl mx-auto space-y-12 py-12">
    <div className="space-y-4 text-center">
      <Badge className="bg-primary/10 text-primary mx-auto">Step 1 of 3</Badge>
      <h2 className="text-5xl font-headline font-black italic uppercase tracking-tighter">Forge Your <br/><span className="text-secondary">Legacy</span></h2>
      <p className="text-on-surface-variant font-medium">Define the identity of your new sports community.</p>
    </div>
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Club Name</label>
        <input className="w-full bg-surface-low border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-secondary text-lg font-bold placeholder:text-on-surface-variant/30" placeholder="e.g. London Smashers" type="text"/>
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Select Primary Sport</label>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-surface-high border-2 border-secondary p-6 rounded-2xl flex flex-col items-center gap-3 group">
            <span className="material-symbols-outlined text-4xl text-secondary">sports_tennis</span>
            <span className="font-bold uppercase tracking-widest text-sm">Pickleball</span>
          </button>
          <button className="bg-surface-high border-2 border-transparent p-6 rounded-2xl flex flex-col items-center gap-3 group hover:border-white/10 transition-colors">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">sports_handball</span>
            <span className="font-bold uppercase tracking-widest text-sm text-on-surface-variant">Badminton</span>
          </button>
        </div>
      </div>
      <Button onClick={onNext} variant="primary" size="lg" className="w-full py-5">
        CONTINUE TO DETAILS <span className="material-symbols-outlined">arrow_forward</span>
      </Button>
    </div>
  </div>
);

const CreateClub2: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => (
  <div className="max-w-xl mx-auto space-y-12 py-12">
    <div className="space-y-4 text-center">
      <Badge className="bg-primary/10 text-primary mx-auto">Step 2 of 3</Badge>
      <h2 className="text-5xl font-headline font-black italic uppercase tracking-tighter">Set the <br/><span className="text-secondary">Vibe</span></h2>
      <p className="text-on-surface-variant font-medium">What makes your club unique? Describe your community.</p>
    </div>
    <div className="space-y-8">
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Club Description</label>
        <textarea className="w-full bg-surface-low border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-secondary text-sm font-medium placeholder:text-on-surface-variant/30 min-h-[150px]" placeholder="Tell potential members about your training style, social events, and goals..."></textarea>
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Privacy Level</label>
        <div className="space-y-3">
          <div className="bg-surface-high p-4 rounded-xl flex items-center gap-4 border-2 border-secondary">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">public</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Public Club</h4>
              <p className="text-[10px] text-on-surface-variant font-medium">Anyone can discover and join your club.</p>
            </div>
            <div className="w-5 h-5 rounded-full border-4 border-secondary bg-background"></div>
          </div>
          <div className="bg-surface-high p-4 rounded-xl flex items-center gap-4 border-2 border-transparent opacity-50">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Private Club</h4>
              <p className="text-[10px] text-on-surface-variant font-medium">Membership requires approval from admins.</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-white/10"></div>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Button onClick={onBack} variant="tertiary" size="lg" className="flex-1">BACK</Button>
        <Button onClick={onNext} variant="primary" size="lg" className="flex-[2]">CONTINUE</Button>
      </div>
    </div>
  </div>
);

const CreateClub3: React.FC<{ onFinish: () => void; onBack: () => void }> = ({ onFinish, onBack }) => (
  <div className="max-w-xl mx-auto space-y-12 py-12">
    <div className="space-y-4 text-center">
      <Badge className="bg-primary/10 text-primary mx-auto">Step 3 of 3</Badge>
      <h2 className="text-5xl font-headline font-black italic uppercase tracking-tighter">Final <br/><span className="text-secondary">Launch</span></h2>
      <p className="text-on-surface-variant font-medium">Upload a cover image to make your club stand out.</p>
    </div>
    <div className="space-y-8">
      <div className="aspect-[16/9] w-full bg-surface-low rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-secondary/50 transition-colors">
        <div className="w-16 h-16 rounded-full bg-surface-high flex items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors">
          <span className="material-symbols-outlined text-4xl">add_a_photo</span>
        </div>
        <div className="text-center">
          <p className="font-bold text-sm">Click to upload cover image</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Recommended: 1920x1080px</p>
        </div>
      </div>
      <div className="bg-surface-high p-6 rounded-2xl border border-white/5">
        <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-primary">Quick Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Name</span>
            <span className="font-bold">London Smashers</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Sport</span>
            <span className="font-bold">Pickleball</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Privacy</span>
            <span className="font-bold">Public</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Button onClick={onBack} variant="tertiary" size="lg" className="flex-1">BACK</Button>
        <Button onClick={onFinish} variant="launch" size="lg" className="flex-[2]">
          LAUNCH CLUB <span className="material-symbols-outlined">rocket_launch</span>
        </Button>
      </div>
    </div>
  </div>
);

const BookScreen: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      <section className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-black italic uppercase tracking-tighter">Find Your <br/><span className="text-secondary">Arena</span></h2>
            <p className="text-on-surface-variant font-medium">Book professional-grade courts across London's elite sports network.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Select Sport</label>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-secondary text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">sports_tennis</span> Pickleball
                </button>
                <button className="bg-surface-high text-on-surface-variant font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/5">
                  <span className="material-symbols-outlined text-sm">sports_handball</span> Badminton
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</label>
              <div className="bg-surface-low p-4 rounded-xl flex items-center justify-between border border-white/5">
                <span className="font-bold">Today, 14 April</span>
                <span className="material-symbols-outlined text-primary">calendar_today</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Time Range</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map(t => (
                  <button key={t} className="bg-surface-high px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border border-white/5">{t}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-2/3 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Showing 12 results near you</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl bg-surface-high flex items-center justify-center border border-white/5"><span className="material-symbols-outlined text-sm">grid_view</span></button>
              <button className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center border border-white/5"><span className="material-symbols-outlined text-sm">map</span></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURTS.map(court => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const FeedScreen: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {[
          { u: "You", i: "https://picsum.photos/seed/me/200/300", a: true },
          { u: "Marcus", i: "https://picsum.photos/seed/m/200/300" },
          { u: "Elena", i: "https://picsum.photos/seed/e/200/300" },
          { u: "Coach K", i: "https://picsum.photos/seed/k/200/300" },
          { u: "Sarah", i: "https://picsum.photos/seed/s/200/300" }
        ].map((story, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className={cn(
              "w-16 h-16 rounded-full p-1",
              story.a ? "bg-surface-high" : "bg-gradient-to-tr from-secondary to-primary"
            )}>
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                <img src={story.i} alt={story.u} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{story.u}</span>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {[
          {
            user: "Marcus V.",
            avatar: "https://picsum.photos/seed/m/100/100",
            time: "2h ago",
            content: "Finally broke into the Top 15! Huge thanks to the London Shuttle Elites for the training sessions this week. The velocity is real. 🚀",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHnnXsIY_CqTykAtATH_11qLvlieusHpDg9kORe_wqIB57rh3_Vs5QR5Mzlz2xqrtIgSFNV9F_gX-cEqETpLKIwclU9A37MCHjx6aTTEv9VzA42YpadFxqLkRAx3gYcrqCCG-z2ABZFYMKw5btjALNrCYgcj-LvGAzkhWk4qD8zn4Oejx5z-qFDQGdZFPuklY3viLDseZl_hfoOCED373EDdHX3twBx2vP4kuq3jKdbKBndaGqXQN4-xQgUGcroJLJAHRboJpwJ5fH",
            likes: 124,
            comments: 18
          },
          {
            user: "Pickle Plaza",
            avatar: "https://picsum.photos/seed/pp/100/100",
            time: "5h ago",
            content: "New premium courts are now open! 8 outdoor surfaces with professional lighting. Book your slot now for the weekend. 🎾",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4z8a5vzvo9nzzgSoXAKTbcuRPgAqhv_Hsvn430hOoX7RxVp3DShNUwllN0giNfHUImo5ja5jF0_bdOHGpDo0kDK8WZN2yG7YgHbjA_T_szLPJmv83EbVEJXAK-hwPq--Mi_LY-1hmT9aeKaXTXaSsGTj5W5un6p4PfDEEG1ImVXMNweDKiy8dfm3Di78HEc4S_oZjcTXI4Z0cJLHPdNDq13R_-P6GX_kusaogmoQ_FTqeQr7buvB_RuGWRaciYgGrYzedDT9eB2JJ",
            likes: 89,
            comments: 5
          }
        ].map((post, i) => (
          <div key={i} className="bg-surface-low rounded-2xl overflow-hidden border border-white/5">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-bold text-sm">{post.user}</h4>
                  <p className="text-[10px] text-on-surface-variant font-medium">{post.time}</p>
                </div>
              </div>
              <button className="text-on-surface-variant"><span className="material-symbols-outlined">more_horiz</span></button>
            </div>
            <div className="px-4 pb-4">
              <p className="text-sm text-on-surface/90 leading-relaxed">{post.content}</p>
            </div>
            {post.image && (
              <div className="aspect-square w-full">
                <img src={post.image} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="p-4 flex items-center gap-6">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors">
                <span className="material-symbols-outlined text-xl">favorite</span>
                <span className="text-xs font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
                <span className="text-xs font-bold">{post.comments}</span>
              </button>
              <button className="ml-auto text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LiveTelecastScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-80" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHnnXsIY_CqTykAtATH_11qLvlieusHpDg9kORe_wqIB57rh3_Vs5QR5Mzlz2xqrtIgSFNV9F_gX-cEqETpLKIwclU9A37MCHjx6aTTEv9VzA42YpadFxqLkRAx3gYcrqCCG-z2ABZFYMKw5btjALNrCYgcj-LvGAzkhWk4qD8zn4Oejx5z-qFDQGdZFPuklY3viLDseZl_hfoOCED373EDdHX3twBx2vP4kuq3jKdbKBndaGqXQN4-xQgUGcroJLJAHRboJpwJ5fH" 
          alt="Badminton" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60"></div>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col pt-24 pb-32 px-4">
        <div className="flex flex-col gap-4 mb-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="kinetic-glass rounded-xl p-4 flex-1 flex flex-col border-l-4 border-primary">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">Set 3 • Quarter Finals</span>
                  <h2 className="font-headline font-extrabold text-xl tracking-tight leading-none mt-1">LEE ZII JIA</h2>
                </div>
                <div className="font-headline font-black text-4xl text-secondary text-glow-primary">21</div>
              </div>
            </div>
            <div className="flex flex-col items-center px-4">
              <span className="font-headline font-black text-on-surface-variant/30 text-2xl">VS</span>
            </div>
            <div className="kinetic-glass rounded-xl p-4 flex-1 flex flex-col border-r-4 border-on-surface-variant/20">
              <div className="flex justify-between items-end flex-row-reverse">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">World Rank #1</span>
                  <h2 className="font-headline font-extrabold text-xl tracking-tight leading-none mt-1">V. AXELSEN</h2>
                </div>
                <div className="font-headline font-black text-4xl text-on-surface-variant/60">19</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="kinetic-glass w-10 h-10 rounded-full flex items-center justify-center text-primary"><span className="material-symbols-outlined">settings</span></button>
            <button className="kinetic-glass w-10 h-10 rounded-full flex items-center justify-center text-primary"><span className="material-symbols-outlined">share</span></button>
            <button className="kinetic-glass w-10 h-10 rounded-full flex items-center justify-center text-secondary"><span className="material-symbols-outlined">hd</span></button>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-low/60 backdrop-blur-md rounded-xl p-3 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Win Probability</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="bg-secondary h-full" style={{ width: '62%' }}></div>
                </div>
                <span className="text-xs font-bold font-headline text-secondary">62%</span>
              </div>
            </div>
            <div className="bg-surface-low/60 backdrop-blur-md rounded-xl p-3 flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Avg Smash Speed</span>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-lg font-headline font-black text-primary">384</span>
                <span className="text-[10px] font-bold mb-1 opacity-50">km/h</span>
              </div>
            </div>
          </div>
          
          <div className="h-48 overflow-y-auto hide-scrollbar flex flex-col gap-3">
            {[
              { u: "CourtKing88", m: "That smash was insane! Lee is on fire today. 🔥", c: "text-primary" },
              { u: "SmashQueen", m: "Axelsen needs to slow the pace down. He's rushing his net play.", c: "text-secondary" },
              { u: "BadmintonExpert", m: "This is the best match of the tournament so far!", c: "text-tertiary" }
            ].map((chat, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0"></div>
                <div className="bg-surface-highest/60 backdrop-blur-sm px-3 py-2 rounded-2xl rounded-tl-none">
                  <p className={cn("text-xs font-bold mb-0.5", chat.c)}>{chat.u}</p>
                  <p className="text-sm text-on-surface/90">{chat.m}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-surface-low/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3 flex items-center">
              <input className="bg-transparent border-none focus:ring-0 text-sm flex-1 placeholder:text-on-surface-variant/50" placeholder="Send a message..." type="text"/>
              <button className="text-primary"><span className="material-symbols-outlined">mood</span></button>
            </div>
            <button className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-black shadow-lg"><span className="material-symbols-outlined">send</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileScreen: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      <section className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="absolute -top-12 -left-8 opacity-5 font-headline font-black text-9xl pointer-events-none select-none">PLAYER ONE</div>
        <div className="md:col-span-4 flex flex-col items-center md:items-start gap-6">
          <div className="relative group">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden ring-4 ring-primary/20 shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCOa5tWljoDHzzG8wYUMfM81GNkeM4iz05rNjoyLBJEAO2RNLrQ7RzpVFGw0nEkqLBV2166eNE4mIB889SNG-rwPXavKvbochbDAEOYmd5ZzCEx4HajPOhkh1AlO_LDREXLx7xVa7lcFeD5XFQMLBWM4tILaYKvzMzMhvtZmSZlL5dCi_3DXKZ5Zm5iRzczSJmtXF7NSUeQztAh-YUOWYSWQ9lftB3eluBPTXjU7YN-DxOshlN-uJiV9i35ZhE__uJgzkoDMqUfenp" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-secondary text-black px-6 py-2 rounded-lg font-headline font-bold text-lg shadow-xl skew-x-[-12deg]">
              PRO TIER
            </div>
          </div>
        </div>
        <div className="md:col-span-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h2 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase italic">Player One</h2>
              <span className="material-symbols-outlined text-secondary text-4xl fill-1">verified</span>
            </div>
            <p className="text-on-surface-variant font-medium text-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              London, United Kingdom • <span className="text-primary">Member since 2023</span>
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Total Wins", v: "142", c: "text-secondary" },
              { l: "Total Loss", v: "28", c: "text-error" },
              { l: "Win Ratio", v: "83.5%", c: "text-primary" },
              { l: "Global Rank", v: "#14", c: "text-tertiary" }
            ].map((stat, i) => (
              <div key={i} className="bg-surface-low p-6 rounded-xl space-y-1 group hover:bg-surface-high transition-colors">
                <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest">{stat.l}</span>
                <div className={cn("text-4xl font-headline font-bold", stat.c)}>{stat.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-low rounded-2xl overflow-hidden group">
          <div className="h-2 bg-secondary w-full"></div>
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-3xl font-headline font-bold flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">sports_tennis</span>
                  Pickleball
                </h3>
                <p className="text-on-surface-variant font-medium">Season Performance</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-secondary uppercase tracking-tighter">LVL 24</div>
                <div className="text-xs text-on-surface-variant">Elite Class</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {[{ l: "Accuracy", v: 92 }, { l: "Power", v: 78 }].map(s => (
                  <div key={s.l} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span>{s.l}</span>
                      <span>{s.v}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: `${s.v}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative flex justify-center items-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle className="text-surface-highest" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-secondary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="30" strokeWidth="8"></circle>
                </svg>
                <div className="absolute text-center">
                  <span className="block text-xl font-headline font-bold">14.2</span>
                  <span className="block text-[8px] font-bold uppercase">Avg/Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-low rounded-2xl overflow-hidden group">
          <div className="h-2 bg-primary w-full"></div>
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-3xl font-headline font-bold flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">sports_handball</span>
                  Badminton
                </h3>
                <p className="text-on-surface-variant font-medium">Aero-Dynamics Score</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-primary uppercase tracking-tighter">LVL 18</div>
                <div className="text-xs text-on-surface-variant">Master Class</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {[{ l: "Agility", v: 88 }, { l: "Reaction", v: 95 }].map(s => (
                  <div key={s.l} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span>{s.l}</span>
                      <span>{s.v}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${s.v}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative flex justify-center items-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle className="text-surface-highest" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="text-primary" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="60" strokeWidth="8"></circle>
                </svg>
                <div className="absolute text-center">
                  <span className="block text-xl font-headline font-bold">21.5</span>
                  <span className="block text-[8px] font-bold uppercase">Avg/Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const GroupsScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-12">
      <section>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-grow md:w-2/3 h-80 rounded-2xl overflow-hidden group">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvJ3xxSDZDPUPVUoiZ9-lAsk6TKVOjAF1O-_zuN1JFJw5sRrAFuWrWsk-P5GMOIbgWeNkgEdD-KHuTqg4tGioHnI6XFK-7N5A9HWobxwwVxc53a4YFh9WdbEP9tcIwjdJ0JZA6D4IlFbmXwxQjF_gibh8fn6f9fShKrAfr0PlcH1hPpVnmreFc8YLdTZPbwsZP6pdHjYIc47LAzKAqXZsquEabvgP3gCC4iYWJiHgDu6aPYSuC9G8l1ZiSCxtUMA2MD6TPP_9tw085" 
              alt="Hero" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-secondary text-black">Trending</Badge>
                <Badge pulse className="bg-surface-bright/40 backdrop-blur-md text-secondary">LIVE NOW</Badge>
              </div>
              <h2 className="text-4xl font-extrabold mb-2 tracking-tighter text-white">London Shuttle Elites</h2>
              <p className="text-on-surface-variant max-w-md text-sm mb-6 font-medium">Premier badminton club in Central London. High-intensity training sessions every Tuesday and Thursday.</p>
              <Button variant="primary" className="w-fit">
                Join Club <span className="material-symbols-outlined">arrow_forward</span>
              </Button>
            </div>
          </div>
          <div className="md:w-1/3 flex flex-col gap-6">
            <div className="bg-surface-high rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-l-4 border-primary">
              <div className="z-10">
                <h3 className="text-primary font-bold text-xl mb-1">Weekly Challenge</h3>
                <p className="text-on-surface-variant text-sm font-medium mb-4">Westside Smashers are looking for 4 players for the weekend tournament.</p>
              </div>
              <div className="flex -space-x-3 z-10">
                {[1, 2, 3].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-surface-high" src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" referrerPolicy="no-referrer" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-surface-high bg-surface-highest flex items-center justify-center text-[10px] font-bold text-primary">+12</div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-8xl">sports_tennis</span>
              </div>
            </div>
            <div 
              onClick={() => onNavigate('create-club-1')}
              className="bg-surface-highest rounded-2xl p-6 flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">group_add</span>
              </div>
              <h3 className="font-bold text-lg text-white">Start a New Group</h3>
              <p className="text-on-surface-variant text-xs mt-1">Can't find your squad? Build it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
          <input className="w-full bg-surface-low border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary text-sm placeholder:text-on-surface-variant" placeholder="Search clubs, cities or players..." type="text"/>
        </div>
        <div className="flex gap-2">
          <Button variant="tertiary" size="sm">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filters
          </Button>
          <Button variant="tertiary" size="sm" className="bg-primary/10 text-primary border-none">Pickleball</Button>
          <Button variant="tertiary" size="sm" className="text-on-surface-variant border-none">Badminton</Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GROUPS.map(group => (
          <GroupCard key={group.id} group={group} />
        ))}
      </section>
    </div>
  );
};

const LiveScoreScreen: React.FC = () => {
  return (
    <div className="space-y-12 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-surface-low p-1">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#b8f600_0%,transparent_70%)]"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-background rounded-[1.4rem] p-8 md:p-12">
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <div className="relative">
              <img className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE-983OMJW2BEqiUSlJEDFD_80__2XJPoOfLhtJU0vkJYy_X52vKUJfR9l9HVmi5hmKnYKxXmlZCQpmB4iT6_1cYoOqwaTl5zKYjFXqV-Av8WzR_LcCbhbSbh2RQwv9Eps3r3a27Q3Dl0q-L3J4A_36Wy1xaecwDIjn0Yg-bEGlI1Zrd7BkiaN620iTeVkJIHrbEcPA1fEWiqMI9t9INHcBIXEmc1gxJR8d3dAwxSfH8rcWtk3kQoHQMEfRuBhFE68R3j9DUgmEGsJ" alt="Marcus" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-2 -right-2 bg-secondary text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">Rank 12</div>
            </div>
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight">Marcus V.</h2>
              <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest">The Striker</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center gap-8">
              <div className="font-headline text-8xl md:text-9xl font-black text-secondary drop-shadow-[0_0_30px_rgba(184,246,0,0.3)]">11</div>
              <div className="font-headline text-4xl text-on-surface-variant/30 font-light">:</div>
              <div className="font-headline text-8xl md:text-9xl font-black text-on-surface-variant">08</div>
            </div>
            <div className="flex flex-col items-center">
              <Badge pulse className="bg-secondary/10 text-secondary mb-2">Live: Set 3</Badge>
              <p className="text-on-surface-variant/60 font-label text-[12px] uppercase tracking-widest">Match Point: Marcus V.</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="relative">
              <img className="w-24 h-24 rounded-full object-cover border-4 border-surface-highest shadow-2xl grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSdp0u0uwbLyEzF2TEkvKT4Eh9mLE3OUZ-fm0hKwHg3tz44ZnD2RuXnONUiMBaPP5S3bEzxOyX2cxPZHGX1J8gukVoQFRmBltTZiFb1DIzJrs-sERcendMMIJPhav4FFtKdFDx5cQPP4jHtP1zOThnWJsj9cEIE7nNK08gChdSXTcnKlhE2MTbQDh1OTj5Hubw-v22TEM_cUmLywQzwEbidpixnhnyzb-1x_kaOv-j2ptE8gRFljCeGFP56oWrwArzpk7KagPWok4M" alt="Elena" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-2 -left-2 bg-surface-highest text-on-surface px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Rank 18</div>
            </div>
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface-variant">Elena S.</h2>
              <p className="text-on-surface-variant/50 text-sm font-medium uppercase tracking-widest">The Wall</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-surface-low rounded-3xl p-8 flex flex-col space-y-6">
          <SectionHeader title="Point History" action={
            <div className="flex gap-2">
              <div className="w-24 h-1 rounded-full bg-secondary"></div>
              <div className="w-12 h-1 rounded-full bg-surface-high"></div>
            </div>
          } />
          <div className="space-y-4">
            <div className="grid grid-cols-12 items-center text-sm font-label uppercase tracking-widest text-on-surface-variant/60 border-b border-white/5 pb-2">
              <div className="col-span-2">Point</div>
              <div className="col-span-4">Marcus V.</div>
              <div className="col-span-4">Elena S.</div>
              <div className="col-span-2 text-right">Type</div>
            </div>
            {[
              { p: 19, s1: 11, s2: "08", t: "Winner", c: "text-secondary" },
              { p: 18, s1: 10, s2: "08", t: "U. Error", c: "text-error" },
              { p: 17, s1: 10, s2: "07", t: "Ace", c: "text-primary" },
              { p: 16, s1: "09", s2: "07", t: "Normal", c: "text-white" }
            ].map((row, i) => (
              <div key={i} className={cn("grid grid-cols-12 items-center p-4 rounded-xl", i === 0 && "bg-surface-highest/50")}>
                <div className={cn("col-span-2 font-black", i === 0 ? "text-secondary" : "text-on-surface-variant/40")}>{row.p}</div>
                <div className={cn("col-span-4 font-bold", i === 0 && "text-secondary")}>{row.s1}</div>
                <div className="col-span-4 font-bold">{row.s2}</div>
                <div className={cn("col-span-2 text-right text-[10px]", row.c)}>{row.t}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-4 bg-surface-highest rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold tracking-tight text-primary mb-6">Set Scores</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Set 1</span>
                <div className="flex gap-4 font-headline text-lg font-bold">
                  <span className="text-secondary">11</span>
                  <span className="text-on-surface-variant/40">09</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Set 2</span>
                <div className="flex gap-4 font-headline text-lg font-bold">
                  <span className="text-on-surface-variant/40">07</span>
                  <span className="text-on-surface-variant">11</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-secondary/5 p-3 rounded-lg border border-secondary/20">
                <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">Set 3 (Current)</span>
                <div className="flex gap-4 font-headline text-lg font-black">
                  <span className="text-secondary">11</span>
                  <span className="text-on-surface-variant">08</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="primary" className="mt-8">
            <span className="material-symbols-outlined">sports_tennis</span>
            MATCH ANALYTICS
          </Button>
        </div>
      </div>
    </div>
  );
};

const HomeScreen: React.FC<{ onNavigate: (s: Screen) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 relative group overflow-hidden rounded-xl bg-surface-low aspect-[16/9] md:aspect-auto min-h-[320px]">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcZ2akvmlU1Zus_VmLbcn2LG7KRoKrfRxxff28DQJI7-tYLElVq8zCpsJ9BQ2i__7gCrPaHhrNqbL_NAId0G4augJGaU2TuXYjzxDfTl-zZNuFv8haEKOpOzhpPk1kkNu5BoAvOCYr-DYOhPQL6eoeH7I-a6yIdc5kYEBKmzc7ejOn9dE2Kp4RERjyJSyZAqgvzZVLWyOiev9ZsSMlm9D0cvqNorDH9uygPqcOhzd1sS_c6zUMV4DWvZ87UC_aMYAQN7PAYM5CEjon" 
            alt="Live Match" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge pulse className="bg-secondary text-black">LIVE NOW</Badge>
            <Badge className="bg-surface-bright/40 backdrop-blur-md text-white">Badminton Pro League</Badge>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="font-headline text-4xl md:text-5xl font-black italic tracking-tighter mb-2 leading-none uppercase">
              Vanguard <span className="text-secondary">Open</span> 24
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary border-2 border-background overflow-hidden">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAIpTQK0z3XKKGMwyw0forixXX4RMhmktTrWHjjtGCh37f_H7_X8_imuEMDRGLxeWBwWUsjTgzDAw-xA9YmDT8rCDweFuS8i3nJwh8vkAJet4gBWUlySu_8j5JOT7VCYaQLLwu0GxnTCq6BbL8znByg06uDAdqxrqiGPOZp-y1Qb2MfZFCzEiu9REaZ0d52giPrwvge3xVDuilGYJxhkl-MzoPYFz0wZwuHmzuKl7-qQYH1cGDdbirXDAditgCD9ExXmHWhG1bR8iJ" alt="P1" referrerPolicy="no-referrer" />
                </div>
                <span className="font-bold text-lg">CHEN W.</span>
              </div>
              <span className="text-primary font-black italic text-2xl">VS</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">AXELSEN V.</span>
                <div className="w-8 h-8 rounded-full bg-tertiary border-2 border-background overflow-hidden">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtCLvkFpteerP_gQWHASRkv4-N5RInoa-n7-juv32DqbgXDJAozVtxGcOMkVoiJgyVL_HGdg_sbOVGKna3XGLduWErRFQKW1zJ8C3ztucw3f3JS2F3NeVK8nDWSSCXBF_-uWnyWW9Ip2Z1MTmMho-qkIIjC4H3alaY1uSPcxXRBPedhEcLaishFj_WJHScpkK2YmgT-uEKl8Q0WgABPlG9iQ9uE3SHyI9qajaKUBuSowhbXWVpzGcx9bmzzvBwJ4pTjksjRcpzbxAU" alt="P2" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
            <Button onClick={() => onNavigate('live-telecast')} variant="primary" className="w-fit">
              <span className="material-symbols-outlined fill-1">play_circle</span>
              WATCH BROADCAST
            </Button>
          </div>
        </div>
        <div className="md:col-span-4 grid grid-cols-1 gap-6">
          <div className="bg-surface-high p-6 rounded-xl flex flex-col justify-between border-l-4 border-secondary">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-bold text-xs uppercase tracking-widest">Your Weekly Velocity</span>
                <span className="text-secondary material-symbols-outlined">trending_up</span>
              </div>
              <div className="font-headline text-5xl font-black text-white leading-none mb-1">1,240 <span className="text-xl text-primary">XP</span></div>
              <p className="text-on-surface-variant text-sm font-medium">Top 5% of Players in London</p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex justify-between text-xs font-bold uppercase mb-2">
                <span>Level 14</span>
                <span>Level 15</span>
              </div>
              <div className="h-2 w-full bg-surface-low rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[85%]"></div>
              </div>
            </div>
          </div>
          <div className="bg-primary text-black p-6 rounded-xl relative overflow-hidden group cursor-pointer">
            <div className="relative z-10">
              <h3 className="font-headline text-2xl font-black leading-tight mb-2 uppercase italic">Court <br/>Discovery</h3>
              <p className="text-sm font-bold opacity-80 mb-4">Find elite surfaces nearby</p>
              <Button variant="tertiary" size="sm" className="bg-black text-primary border-none w-fit">
                EXPLORE <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Button>
            </div>
            <span className="absolute -bottom-4 -right-4 text-9xl font-black italic opacity-10 leading-none select-none">MAP</span>
          </div>
        </div>
      </section>

      {/* Real-Time Volleys */}
      <section>
        <SectionHeader 
          title="Real-Time Volleys" 
          subtitle="Active matches across the Kinetic network"
          action={
            <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              VIEW ALL <span className="material-symbols-outlined text-xs">chevron_right</span>
            </button>
          }
        />
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
          {MATCHES.map(match => (
            <div key={match.id} className="min-w-[280px] bg-surface-highest p-4 rounded-xl shadow-lg border-b-2 border-secondary">
              <div className="flex justify-between items-center mb-3">
                <Badge className="bg-secondary/10 text-secondary">Live • {match.court}</Badge>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">{match.sport}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                    <span className="font-bold text-sm">{match.player1}</span>
                  </div>
                  <span className="font-headline font-black text-xl text-secondary">{match.score1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent"></div>
                    <span className="font-bold text-sm opacity-60">{match.player2}</span>
                  </div>
                  <span className="font-headline font-black text-xl opacity-60">{match.score2}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Book Nearby */}
      <section>
        <SectionHeader title="Quick Book" subtitle="Nearby" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COURTS.map(court => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      </section>

      {/* Upcoming Arenas */}
      <section>
        <SectionHeader title="Upcoming" subtitle="Arenas" />
        <div className="bg-surface-low rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-white/5">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-tertiary/20 to-transparent"></div>
          <div className="z-10 flex-1">
            <Badge className="bg-tertiary text-black mb-4 w-fit">REGISTRATION OPEN</Badge>
            <h3 className="font-headline text-4xl font-black italic uppercase leading-none mb-2">Summer Smash <br/>Invitational</h3>
            <p className="text-on-surface-variant max-w-md mb-6 font-medium">Join the region's largest Pickleball doubles tournament. £5,000 prize pool up for grabs at the London Olympic Park.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-tertiary">calendar_month</span>
                AUG 12-14
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="material-symbols-outlined text-tertiary">location_on</span>
                LONDON
              </div>
            </div>
          </div>
          <div className="z-10">
            <Button variant="secondary" size="lg" className="bg-white text-black rounded-full">
              REGISTER TEAM
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return <HomeScreen onNavigate={setScreen} />;
      case "groups":
        return <GroupsScreen onNavigate={setScreen} />;
      case "live":
        return <LiveScoreScreen />;
      case "live-telecast":
        return <LiveTelecastScreen />;
      case "book":
        return <BookScreen />;
      case "profile":
        return <ProfileScreen />;
      case "feed":
        return <FeedScreen />;
      case "create-club-1":
        return <CreateClub1 onNext={() => setScreen("create-club-2")} />;
      case "create-club-2":
        return <CreateClub2 onNext={() => setScreen("create-club-3")} onBack={() => setScreen("create-club-1")} />;
      case "create-club-3":
        return <CreateClub3 onFinish={() => setScreen("groups")} onBack={() => setScreen("create-club-2")} />;
      default:
        return <HomeScreen onNavigate={setScreen} />;
    }
  };

  const showNav = !["live-telecast", "create-club-1", "create-club-2", "create-club-3"].includes(screen);
  const showBack = ["live-telecast", "create-club-1", "create-club-2", "create-club-3"].includes(screen);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar 
        title={screen === "home" ? "KINETIC" : screen.replace(/-/g, " ").toUpperCase()} 
        showBack={showBack}
        onBack={() => {
          if (screen === "live-telecast") setScreen("home");
          else if (screen.startsWith("create-club")) setScreen("groups");
        }}
        onAction={() => setScreen("groups")}
        actionIcon={screen === "home" ? "notifications" : "group"}
      />
      <main className={cn("pt-24 px-6 max-w-7xl mx-auto", showNav ? "pb-32" : "pb-6")}>
        {renderScreen()}
      </main>
      {showNav && <BottomNavBar activeScreen={screen} onNavigate={setScreen} />}
    </div>
  );
}
