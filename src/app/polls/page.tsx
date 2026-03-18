"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Vote, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface PollVote { id: string; personId: string; person: Person; }
interface PollOption { id: string; text: string; votes: PollVote[]; }
interface Poll {
  id: string;
  question: string;
  closedAt: string | null;
  options: PollOption[];
  createdAt: string;
}

const OPTION_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-amber-500",
  "bg-pink-500", "bg-red-500", "bg-teal-500", "bg-orange-500",
];

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState("none");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const fetchAll = async () => {
    const [pollRes, perRes] = await Promise.all([
      fetch("/api/polls"),
      fetch("/api/persons"),
    ]);
    setPolls(await pollRes.json());
    setPersons(await perRes.json());
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setQuestion(""); setOptions(["", ""]); setOpen(true);
  };

  const handleSave = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options: validOptions }),
    });
    setOpen(false);
    fetchAll();
  };

  const handleVote = async (optionId: string) => {
    if (selectedVoter === "none") return;
    await fetch("/api/polls/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId, personId: selectedVoter }),
    });
    fetchAll();
  };

  const handleClose = async (poll: Poll) => {
    await fetch(`/api/polls/${poll.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closedAt: poll.closedAt ? null : new Date().toISOString() }),
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/polls/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const getVoterVote = (poll: Poll): string | null => {
    if (selectedVoter === "none") return null;
    for (const opt of poll.options) {
      if (opt.votes.some((v) => v.personId === selectedVoter)) return opt.id;
    }
    return null;
  };

  const activePolls = polls.filter((p) => !p.closedAt);
  const closedPolls = polls.filter((p) => p.closedAt);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            Szavazások
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activePolls.length} aktív · {closedPolls.length} lezárt
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Új szavazás
        </Button>
      </div>

      {/* Voter selector */}
      {persons.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <span className="text-sm font-medium shrink-0">Ki szavaz?</span>
          <Select value={selectedVoter} onValueChange={setSelectedVoter}>
            <SelectTrigger className="max-w-[200px]">
              <SelectValue placeholder="Válassz személyt..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nincs kiválasztva</SelectItem>
              {persons.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVoter !== "none" && (
            <span className="text-sm text-muted-foreground">
              Kattints egy opcióra a szavazáshoz!
            </span>
          )}
        </div>
      )}

      {/* Active polls */}
      {activePolls.length > 0 && (
        <div className="space-y-4 mb-6">
          {activePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              voterVoteId={getVoterVote(poll)}
              canVote={selectedVoter !== "none"}
              onVote={handleVote}
              onClose={handleClose}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Closed polls */}
      {closedPolls.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" /> Lezárt szavazások
          </p>
          <div className="space-y-4">
            {closedPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                voterVoteId={getVoterVote(poll)}
                canVote={false}
                onVote={handleVote}
                onClose={handleClose}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {polls.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
          <Vote className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Még nincs szavazás. Hozd létre az elsőt!</p>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Új szavazás</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kérdés</Label>
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="pl. Hova menjünk nyaralni?" />
            </div>
            <div className="space-y-2">
              <Label>Opciók (min. 2)</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i] = e.target.value;
                      setOptions(updated);
                    }}
                    placeholder={`${i + 1}. opció`}
                  />
                  {options.length > 2 && (
                    <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0"
                      onClick={() => setOptions(options.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setOptions([...options, ""])} className="gap-1 text-xs">
                <Plus className="h-3 w-3" /> Opció hozzáadása
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Mégse</Button>
            <Button onClick={handleSave} disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}>
              Létrehozás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PollCard({
  poll, voterVoteId, canVote, onVote, onClose, onDelete,
}: {
  poll: Poll;
  voterVoteId: string | null;
  canVote: boolean;
  onVote: (optionId: string) => void;
  onClose: (poll: Poll) => void;
  onDelete: (id: string) => void;
}) {
  const isClosed = !!poll.closedAt;
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  const winnerCount = Math.max(...poll.options.map((o) => o.votes.length));

  return (
    <div className={cn(
      "rounded-xl border bg-card p-5",
      isClosed && "opacity-75"
    )}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-base">{poll.question}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(poll.createdAt), "MMM d.", { locale: hu })}
            {" · "}{totalVotes} szavazat
            {isClosed && " · Lezárva"}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => onClose(poll)}>
            {isClosed ? <><Vote className="h-3.5 w-3.5" /> Újranyit</> : <><Lock className="h-3.5 w-3.5" /> Lezár</>}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(poll.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {poll.options.map((opt, i) => {
          const count = opt.votes.length;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isVoted = voterVoteId === opt.id;
          const isWinner = isClosed && count === winnerCount && count > 0;
          const color = OPTION_COLORS[i % OPTION_COLORS.length];

          return (
            <div key={opt.id}>
              <button
                onClick={() => !isClosed && canVote && onVote(opt.id)}
                disabled={isClosed || !canVote}
                className={cn(
                  "w-full rounded-lg border px-4 py-2.5 text-left transition-all",
                  !isClosed && canVote && "hover:border-primary/50 cursor-pointer",
                  isVoted && "border-primary bg-primary/5",
                  isWinner && "border-green-500 bg-green-50 dark:bg-green-950/20",
                  isClosed && "cursor-default"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isVoted ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={cn("text-sm font-medium", isWinner && "text-green-700 dark:text-green-400")}>
                      {opt.text}
                      {isWinner && " 🏆"}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {opt.votes.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {opt.votes.map((v) => (
                      <span key={v.id} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {v.person.name}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
