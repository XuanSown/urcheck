type BadgeItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
};

export function BadgeGrid({ badges, t }: { badges: BadgeItem[]; t: (key: string) => string }) {
  const earned = badges.filter((b) => b.earnedAt);
  const locked = badges.filter((b) => !b.earnedAt);

  return (
    <div className="space-y-8">
      {earned.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('badges_earned')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earned.map((badge) => (
              <div
                key={badge.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4">{t('badges_locked')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-center opacity-50"
              >
                <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-through decoration-gray-400">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
