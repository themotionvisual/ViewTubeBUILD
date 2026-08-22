import os
import re

files = [
    "src/views/dashboard/widgets/ABThumbnailWidget.tsx",
    "src/views/dashboard/widgets/AdStackWidget.tsx",
    "src/views/dashboard/widgets/AIJournalWidget.tsx",
    "src/views/dashboard/widgets/AlgoBenchmarkWidget.tsx",
    "src/views/dashboard/widgets/AskMeWidget.tsx",
    "src/views/dashboard/widgets/AudienceMatrixWidget.tsx",
    "src/views/dashboard/widgets/AudienceRetentionWidget.tsx",
    "src/views/dashboard/widgets/BridgeEfficiencyWidget.tsx",
    "src/views/dashboard/widgets/BurnoutMonitorWidget.tsx",
    "src/views/dashboard/widgets/CollabMatchmakerWidget.tsx",
    "src/views/dashboard/widgets/CommentReplyWidget.tsx",
    "src/views/dashboard/widgets/CommunityPostWidget.tsx",
    "src/views/dashboard/widgets/CpmGeoWidget.tsx",
    "src/views/dashboard/widgets/DailyOracleWidget.tsx",
    "src/views/dashboard/widgets/DataEditWidget.tsx",
    "src/views/dashboard/widgets/DescriptionEditorWidget.tsx",
    "src/views/dashboard/widgets/DeviceMatrixWidget.tsx",
    "src/views/dashboard/widgets/FlightCheckWidget.tsx",
    "src/views/dashboard/widgets/FormatClashWidget.tsx",
    "src/views/dashboard/widgets/GoalsTrackerWidget.tsx",
    "src/views/dashboard/widgets/GuestRatioWidget.tsx",
    "src/views/dashboard/widgets/HashtagAnalyzerWidget.tsx",
    "src/views/dashboard/widgets/KeywordEngineWidget.tsx",
    "src/views/dashboard/widgets/KeywordOverlapWidget.tsx",
    "src/views/dashboard/widgets/PlaybackOriginsWidget.tsx",
    "src/views/dashboard/widgets/PremiumPulseWidget.tsx",
    "src/views/dashboard/widgets/PublishMomentumWidget.tsx",
    "src/views/dashboard/widgets/ReachFunnelWidget.tsx",
    "src/views/dashboard/widgets/RealtimePerformanceWidget.tsx",
    "src/views/dashboard/widgets/RetentionSimWidget.tsx",
    "src/views/dashboard/widgets/RevenueChartWidget.tsx",
    "src/views/dashboard/widgets/SharingDnaWidget.tsx",
    "src/views/dashboard/widgets/TagGeneratorWidget.tsx",
    "src/views/dashboard/widgets/ThumbAIWidget.tsx",
    "src/views/dashboard/widgets/ThumbnailLabWidget.tsx",
    "src/views/dashboard/widgets/TitleRewriterWidget.tsx",
    "src/views/dashboard/widgets/TrafficSourcesWidget.tsx",
    "src/views/dashboard/widgets/UploadSchedulerWidget.tsx"
]

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if updated
    if "onDecSize" in content:
        return

    # Update props in argument list
    def replace_props(match):
        props = match.group(1).strip()
        new_props = props + ", onDecSize, onCycleHeight, onDecHeight"
        return f'({{{new_props}}})'

    new_content = re.sub(r'\(\{([^}]*)\}\)', replace_props, content)
    
    # Update common object
    def replace_common(match):
        common_body = match.group(1).strip()
        new_common_body = common_body + ",\n  onDecSize,\n  onCycleHeight,\n  onDecHeight"
        return f'const common = {{\n  {new_common_body},\n }}'

    new_content = re.sub(r'const common = \{([^}]*)\}', replace_common, new_content)
    
    with open(file_path, 'w') as f:
        f.write(new_content)
    print(f"Updated {file_path}")

for file_path in files:
    update_file(file_path)
