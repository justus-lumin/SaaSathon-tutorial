export type GuideSection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
  sample?: string;
  ordered?: boolean;
};
export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  intro: string;
  sections: GuideSection[];
  related: string[];
  source?: { label: string; url: string };
};
export const guides: Guide[] = [
  {
    slug: "meeting-transcription",
    title: "Meeting transcription, without losing the context",
    description:
      "Learn what a meeting transcript should preserve, how to check uncertain words, and when to use a transcript instead of a summary.",
    category: "Transcripts",
    intro:
      "A transcript keeps the words. A summary keeps the main points. Knowing which one you need makes it easier to return to a conversation with confidence.",
    sections: [
      {
        heading: "Start with the source",
        paragraphs: [
          "Meeting transcription turns recorded speech into written text. A useful transcript follows the conversation in order, including questions, changes of mind, and qualifications that might disappear from a short recap.",
          "The recording remains your reference. If the audio is unclear, a polished-looking sentence can still be wrong. Keep uncertain words visible rather than filling the gap with a plausible guess.",
        ],
      },
      {
        heading: "What belongs in a transcript?",
        paragraphs: [
          "Keep the meaning and sequence intact. Paragraph breaks make long conversations easier to read; timestamps help you find the corresponding audio. Speaker labels are useful only when the speaker is actually known.",
        ],
        items: [
          "Preserve qualifications such as “possibly”, “not yet”, and “if the test passes”.",
          "Check names, amounts, dates, and technical terms before reusing them.",
          "Mark an unclear passage instead of treating a guess as a fact.",
          "Separate a suggestion from a decision, even if both sound confident.",
        ],
      },
      {
        heading: "A small difference that matters",
        paragraphs: [
          "Consider this fictional exchange. The second sentence changes what the first one means.",
        ],
        sample:
          "Alex: We could launch on Friday.\nSam: Only if the recording test passes.\nAlex: Agreed. We have not committed to Friday yet.",
        items: [
          "Transcript: preserve all three statements.",
          "Summary: Friday is a possible launch date, dependent on testing.",
          "Avoid: “The team decided to launch on Friday.”",
        ],
      },
      {
        heading: "Review the parts people will act on",
        paragraphs: [
          "You do not need to turn every casual sentence into formal prose. Spend review time on commitments, figures, names, and disputed points. Listen to the source around an uncertain passage, including what came before and after it.",
          "When sharing an excerpt, include enough context to preserve the speaker’s intent. A quotation that is technically accurate can still mislead if the condition or correction is omitted.",
        ],
      },
      {
        heading: "Try the reading experience",
        paragraphs: [
          "The Meeting Recorder demo contains a fictional transcript alongside its summary. Switch between them to see how the detailed conversation and short recap serve different needs. The example is illustrative, not an accuracy benchmark or a claim about supported languages.",
        ],
      },
    ],
    related: ["meeting-summary", "guides/record-a-meeting-in-your-browser"],
  },
  {
    slug: "meeting-summary",
    title: "How to write a useful meeting summary",
    description:
      "A practical meeting summary format with an example: context, key points, decisions, and action items. Keep uncertainty and ownership clear.",
    category: "Summaries",
    intro:
      "A useful meeting summary helps someone understand what happened and what comes next, without asking them to read the whole conversation.",
    sections: [
      {
        heading: "Use four small sections",
        paragraphs: [
          "Start with one or two sentences of context, then keep only the points that change what someone understands or needs to do. Most routine meetings do not need a long narrative.",
        ],
        items: [
          "Overview: why the meeting happened and what it covered.",
          "Key points: the important information, constraints, or unresolved questions.",
          "Decisions: choices that people explicitly agreed to.",
          "Action items: work that someone actually committed to doing.",
        ],
      },
      {
        heading: "Keep the distinction between discussed and decided",
        paragraphs: [
          "A topic receiving a lot of attention does not mean the group reached a decision. If people explored an option without choosing it, say that. If a choice depends on a condition, include the condition.",
          "Write “The team discussed moving the launch” rather than “The launch moved” when agreement is missing. Leaving an open question visible is more useful than manufacturing a tidy ending.",
        ],
      },
      {
        heading: "An example you can adapt",
        paragraphs: [
          "This example is fictional. It shows how a few lines can preserve both a decision and an unresolved detail.",
        ],
        sample:
          "Overview\nThe team reviewed the first release.\n\nKey points\nThe welcome screen needs a simpler starting point.\n\nDecision\nKeep the initial scope to recording, transcripts, and summaries.\n\nAction items\nAlex: test the recording flow by Friday.\nSam: simplify the welcome screen. No deadline agreed.",
      },
      {
        heading: "Check it against the conversation",
        paragraphs: [
          "Before sharing, compare the summary with the transcript and, where needed, the audio. Pay special attention to numbers, names, commitments, and anything attributed to a person.",
          "Remove repeated points and background detail that does not help the reader. Keep enough context that a teammate who missed the meeting can understand the decisions. Link to the source when a short explanation cannot carry the nuance.",
        ],
        items: [
          "Does each action have an actual commitment behind it?",
          "Are owners and deadlines stated, rather than inferred?",
          "Are unresolved questions still marked as unresolved?",
          "Would someone who attended recognise the result?",
        ],
      },
      {
        heading: "See both views together",
        paragraphs: [
          "The Meeting Recorder example places a short summary beside a complete fictional transcript. Use it to compare the two levels of detail. Generated summaries should be reviewed before they become instructions for other people.",
        ],
      },
    ],
    related: ["meeting-transcription", "guides/meeting-action-items"],
  },
  {
    slug: "guides/record-a-meeting-in-your-browser",
    title: "How to prepare to record a meeting in your browser",
    description:
      "Check your microphone, permissions, audio source, and saving flow before recording a meeting. Understand what microphone capture can and cannot hear.",
    category: "Recording guide",
    intro:
      "A short test before the meeting is more useful than discovering afterwards that only one side of the conversation was recorded.",
    sections: [
      {
        heading: "Choose what you need to capture",
        paragraphs: [
          "For an in-person conversation, think about where the microphone sits and whether it can clearly hear each person. For a remote meeting, distinguish microphone input from audio played by the call.",
          "A microphone source does not automatically include the sound inside another application. If the other participants are in your headphones, do not assume they will appear in a microphone recording. Look for an explicitly supported tab or system-audio source, and test it.",
        ],
      },
      {
        heading: "Run a short preparation check",
        paragraphs: [
          "Before recording the actual conversation, make the recording arrangement clear to everyone and follow the relevant organisational requirements. Then test the same devices and browser you plan to use.",
        ],
        ordered: true,
        items: [
          "Connect your intended microphone or headset before opening the recorder.",
          "Choose the correct audio input, and grant microphone access when requested.",
          "Record a short test with the people or audio sources you need to hear.",
          "Stop and play it back. Confirm both volume and completeness.",
          "Check how saving is confirmed, and where you can find the recording later.",
        ],
      },
      {
        heading: "If microphone access is blocked",
        paragraphs: [
          "Browser microphone access requires permission and a secure context, normally an HTTPS page. Check the site’s microphone permission, your operating system’s permission for the browser, and whether your intended device is connected.",
          "If you change an input or permission, make a new test recording. A moving timer is not evidence that useful audio was captured. Playback is the useful check.",
        ],
      },
      {
        heading: "Finish deliberately",
        paragraphs: [
          "Use the stop control and wait for the app to confirm what has been saved. If an upload fails, keep the page open and follow its recovery instructions. Do not assume closing the tab will finish an upload.",
          "Play the recording before relying on the transcript. Keep the original until you have checked the parts you need, subject to your agreed retention arrangements.",
        ],
      },
      {
        heading: "What this preview demonstrates",
        paragraphs: [
          "The public Meeting Recorder demo shows the reading experience using a fictional meeting. It does not capture audio or prove support for a particular browser or call service. Check the recorder’s stated capture source before using it for a real meeting.",
        ],
      },
    ],
    related: ["meeting-transcription", "guides/meeting-minutes-template"],
    source: {
      label: "MDN: browser microphone access and permissions",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia",
    },
  },
  {
    slug: "guides/meeting-minutes-template",
    title: "A simple meeting minutes template",
    description:
      "Use a concise meeting minutes template for everyday team meetings, with space for decisions, action items, and open questions.",
    category: "Templates",
    intro:
      "Good meeting minutes leave a clear record of the decisions and follow-up work. For an everyday team meeting, a small consistent structure is usually enough.",
    sections: [
      {
        heading: "Capture outcomes before chronology",
        paragraphs: [
          "A transcript follows what was said. Minutes organise the outcome. Start with the purpose and participants, then record decisions, actions, and questions that still need an answer.",
          "These notes are a practical template for ordinary team meetings. Formal boards or committees may have their own required format, approval process, or record-keeping rules; use those where they apply.",
        ],
      },
      {
        heading: "Copy this starting point",
        paragraphs: [
          "Keep each section short. If there were no decisions or actions, say so instead of inventing an item to fill the space.",
        ],
        sample:
          "Meeting title\nDate and time:\nParticipants:\nPurpose:\n\nDecisions\n- Decision and any condition attached to it.\n\nActions\n- Task / owner / agreed deadline.\n\nOpen questions\n- Question / next step to resolve it.\n\nNext meeting\n- Date, if agreed.",
      },
      {
        heading: "Make each action complete",
        paragraphs: [
          "“Follow up” is difficult to use later. Describe the work and its intended result. Add the owner and deadline only if they were agreed during the conversation. Otherwise mark them as unassigned or not agreed.",
          "For example: “Alex will send the revised recording checklist by Friday” is more useful than “Discussed checklist”. It names a concrete deliverable and tells the reader who has the next move.",
        ],
      },
      {
        heading: "Review before circulating",
        paragraphs: [
          "Read the draft while the conversation is still fresh. Check that a suggestion did not become a decision, that absences are not confused with attendance, and that names and dates are accurate.",
        ],
        items: [
          "Separate decisions from discussion notes.",
          "Preserve conditions and objections that change the decision.",
          "Ask for clarification when ownership is unclear.",
          "Share only the details the recipients need.",
        ],
      },
      {
        heading: "Keep minutes and source material connected",
        paragraphs: [
          "A concise record is easier to scan when the supporting detail is available separately. Keep the transcript or recording as a reference where appropriate, rather than pasting every exchange into the minutes.",
          "For a less formal check-in, a short meeting summary may be enough. Choose the format based on what the reader needs to do next.",
        ],
      },
    ],
    related: ["meeting-summary", "guides/meeting-action-items"],
  },
  {
    slug: "guides/meeting-action-items",
    title: "Turn meeting notes into clear action items",
    description:
      "Write meeting action items with a specific task, an agreed owner, and an honest deadline. Includes examples and a review checklist.",
    category: "Next steps",
    intro:
      "An action item should make the next move obvious. It is a commitment to do something, not a topic that happened to come up in the meeting.",
    sections: [
      {
        heading: "Look for a commitment",
        paragraphs: [
          "“We should test the recorder” is a suggestion. “I’ll test the recorder by Friday” is a commitment. Keep that distinction when you turn the conversation into a task list.",
          "Sometimes a meeting ends with useful work identified but no one assigned to it. Record that as an open action needing an owner. Do not silently assign it to the person who raised the topic.",
        ],
      },
      {
        heading: "Write three things",
        paragraphs: [
          "A clear action item names the deliverable, the person responsible, and the agreed deadline. Where a detail is missing, leave it visibly unresolved.",
        ],
        items: [
          "Task: start with a concrete verb and describe the expected result.",
          "Owner: name the person who accepted the work.",
          "Deadline: use the agreed date or say that none was agreed.",
        ],
      },
      {
        heading: "A small before-and-after",
        paragraphs: [
          "These examples are fictional. The improved version stays within the information that was actually agreed.",
        ],
        sample:
          "Vague: Recording flow.\nClear: Alex will test the recording flow by Friday.\n\nVague: Sam to do onboarding ASAP.\nClear: Sam will simplify the welcome screen. Deadline not agreed.\n\nVague: Launch next week.\nClear: Confirm a launch date after the recording test passes. Owner not assigned.",
      },
      {
        heading: "Keep dependencies visible",
        paragraphs: [
          "Some work cannot start until another decision or task is complete. Include that dependency in the action rather than hiding it in background notes. “Publish after approval” is different from “Publish on Friday”.",
          "If a commitment is conditional, keep the condition. If the person declines or changes the commitment later in the meeting, use the final agreed version and retain context where it matters.",
        ],
      },
      {
        heading: "Close the loop at the next meeting",
        paragraphs: [
          "Start the next check-in by reviewing the previous actions. Mark completed work, surface blockers, and agree any changes to ownership or timing. Keep the list short enough that it remains useful.",
          "Before sharing a generated action list, compare each item with the source conversation. A confident-looking task can still be an inference. The Meeting Recorder example lets you compare a short list with its fictional transcript.",
        ],
      },
    ],
    related: ["meeting-summary", "guides/meeting-minutes-template"],
  },
];
export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
