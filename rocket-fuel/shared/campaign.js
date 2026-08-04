
(function (global) {
  'use strict';

  const STORAGE_KEY = 'rocketFuelCampaignProgress';
  const REPLAY_KEY = 'rocketFuelReplayCycle';
  const PENDING_KEY = 'rocketFuelCampaignCompletionPending';

  function readProgress() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        mission1: Boolean(parsed.mission1),
        mission2: Boolean(parsed.mission2),
        mission3: Boolean(parsed.mission3)
      };
    } catch (error) {
      return { mission1: false, mission2: false, mission3: false };
    }
  }

  function writeProgress(progress) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function completeMission(missionNumber) {
    const progress = readProgress();
    progress[`mission${missionNumber}`] = true;
    writeProgress(progress);
    try {
      const replay = JSON.parse(sessionStorage.getItem(REPLAY_KEY) || '{}');
      replay[`mission${missionNumber}`] = true;
      if (replay.mission1 && replay.mission2 && replay.mission3) {
        sessionStorage.setItem(PENDING_KEY, 'true');
        sessionStorage.setItem(REPLAY_KEY, '{}');
      } else {
        sessionStorage.setItem(REPLAY_KEY, JSON.stringify(replay));
      }
    } catch (error) {}
    return progress;
  }

  function consumeCampaignCompletion() {
    try {
      const pending = sessionStorage.getItem(PENDING_KEY) === 'true';
      if (pending) sessionStorage.removeItem(PENDING_KEY);
      return pending;
    } catch (error) { return false; }
  }

  function isUnlocked(missionNumber) {
    const progress = readProgress();
    if (missionNumber === 1) return true;
    if (missionNumber === 2) return progress.mission1;
    if (missionNumber === 3) return progress.mission1 && progress.mission2;
    return false;
  }

  function returnToCampaign() {
    global.location.href = '../index.html';
  }


  function configureCompletionButton(missionNumber) {
    const button = document.getElementById('playAgainButton');
    if (!button) return;
    button.textContent = 'Return to Campaign';
    button.addEventListener('click', function () {
      completeMission(missionNumber);
      returnToCampaign();
    }, { capture: true });
  }

  function initializeMission(missionNumber) {
    if (!isUnlocked(missionNumber)) {
      global.location.replace('../index.html');
      return;
    }
    configureCompletionButton(missionNumber);
  }

  global.RocketFuelCampaign = Object.freeze({
    readProgress,
    writeProgress,
    completeMission,
    isUnlocked,
    returnToCampaign,
    initializeMission,
    consumeCampaignCompletion
  });
})(window);
