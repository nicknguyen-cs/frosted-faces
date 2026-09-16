#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Re-arm the Content Freshness Auditor demo to a known-good planted state.
# Run this BEFORE every rehearsal so the agent always sees identical input.
#
#   bash scripts/reset-agent-demo.sh
#
# DEMO TRUTH (what the agent should find after a reset):
#   • [DEMO] Meet Buddy   → Buddy is ADOPTED, body says "still available"  → HIGH
#   • [DEMO] Daisy Needs You → Daisy is 11yrs / 65lb, body says "Nine-year-old
#                              … petite 20-pound"                          → MEDIUM (age) + LOW (weight)
#   • [DEMO] Sadie's Adoption Story → Sadie ADOPTED, body says "found her
#                              forever home" (consistent)                  → NONE (control / no false positive)
# Expected correct run: 2 posts flagged (Buddy, Daisy); Sadie untouched.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env.local 2>/dev/null || . ./.env; set +a
HOST="https://api.contentstack.io"
AK="$CONTENTSTACK_API_KEY"; AT="$CONTENTSTACK_MANAGEMENT_TOKEN"

# entry uids
BUDDY_DOG="blt1b9991be5947239f"; DAISY_DOG="blt4b2c15acb708bfc9"; SADIE_DOG="blt70f2a23857898e1a"
BUDDY_POST="blt0a724f8e9cdecc88"; DAISY_POST="blt59522ba33493a2dc"; SADIE_POST="blt1f49e8d37f5328de"
DRAFT_STAGE="blt18886c305cc120b7"   # GA workflow → "Draft" (the agent parks posts in "Content Refresh Review")

put() { # $1=content_type  $2=uid  $3=payload-json
  curl -s -X PUT "$HOST/v3/content_types/$1/entries/$2" \
    -H "api_key: $AK" -H "authorization: $AT" -H "Content-Type: application/json" \
    --data "$3" | tr -d '\000-\037' | jq -r --arg u "$2" '"  " + $u + ": " + (.notice // .error_message // "?")'
}

setstage() { # $1=blog_post uid  → move back to Draft (clears the "in review" state)
  curl -s -X POST "$HOST/v3/content_types/blog_post/entries/$1/workflow" \
    -H "api_key: $AK" -H "authorization: $AT" -H "Content-Type: application/json" \
    --data "{\"workflow\":{\"workflow_stage\":{\"uid\":\"$DRAFT_STAGE\",\"comment\":\"Re-armed for demo\"}}}" \
    | tr -d '\000-\037' | jq -r --arg u "$1" '"  " + $u + ": " + (.notice // .error_message // "?")'
}

echo "Resetting demo dogs…"
p=$(jq -n '{entry:{status:"adopted"}}');                              put dog "$BUDDY_DOG" "$p"
p=$(jq -n '{entry:{status:"available",age:"11 years",weight:65}}');   put dog "$DAISY_DOG" "$p"
p=$(jq -n '{entry:{status:"adopted"}}');                              put dog "$SADIE_DOG" "$p"

echo "Resetting demo posts…"
p=$(jq -n \
  --arg t "[DEMO] Meet Buddy" \
  --arg e "Say hello to Buddy, a gentle Labrador." \
  --arg b "<h2>Meet Buddy</h2><p>Buddy is still available and waiting for his forever home. This gentle Labrador has been with us for a little while now, and he cannot wait to meet his new family.</p><p>If you have room in your home and your heart, come say hello to Buddy. He is ready to go home today.</p>" \
  --arg d "$BUDDY_DOG" \
  '{entry:{title:$t,excerpt:$e,body:$b,associated_dogs:[{uid:$d,_content_type_uid:"dog"}]}}')
put blog_post "$BUDDY_POST" "$p"

p=$(jq -n \
  --arg t "[DEMO] Daisy Needs You" \
  --arg e "A gentle senior golden hoping for a quiet home." \
  --arg b "<h2>A quiet home for Daisy</h2><p>Nine-year-old Daisy is a petite 20-pound sweetheart who lights up every room she enters. This little golden loves slow morning walks and long afternoon naps in a sunny spot.</p><p>Daisy is still looking for a calm, loving home to call her own. Could it be yours?</p>" \
  --arg d "$DAISY_DOG" \
  '{entry:{title:$t,excerpt:$e,body:$b,associated_dogs:[{uid:$d,_content_type_uid:"dog"}]}}')
put blog_post "$DAISY_POST" "$p"

p=$(jq -n \
  --arg t "[DEMO] Sadie's Adoption Story" \
  --arg e "A happy ending for a very good girl." \
  --arg b "<h2>Sadie found her home</h2><p>We are overjoyed to share that Sadie has found her forever home! After months of patient waiting, this sweet beagle is now curled up on her very own couch with a family who adores her.</p><p>Thank you to everyone who shared her story and helped make this happy ending possible.</p>" \
  --arg d "$SADIE_DOG" \
  '{entry:{title:$t,excerpt:$e,body:$b,associated_dogs:[{uid:$d,_content_type_uid:"dog"}]}}')
put blog_post "$SADIE_POST" "$p"

echo "Resetting workflow stage to Draft…"
setstage "$BUDDY_POST"; setstage "$DAISY_POST"; setstage "$SADIE_POST"

echo "Verifying planted state…"
for pair in "dog:$BUDDY_DOG" "dog:$DAISY_DOG" "dog:$SADIE_DOG"; do
  ct="${pair%%:*}"; uid="${pair##*:}"
  curl -s "$HOST/v3/content_types/$ct/entries/$uid" -H "api_key: $AK" -H "authorization: $AT" \
    | tr -d '\000-\037' | jq -r '"  dog \(.entry.title): status=\(.entry.status) age=\(.entry.age) weight=\(.entry.weight)"'
done
for uid in "$BUDDY_POST" "$DAISY_POST" "$SADIE_POST"; do
  curl -s "$HOST/v3/content_types/blog_post/entries/$uid?include_workflow=true" -H "api_key: $AK" -H "authorization: $AT" \
    | tr -d '\000-\037' | jq -r '"  post \(.entry.title): stage=\(.entry._workflow.name // "none")  excerpt=\"\(.entry.excerpt)\""'
done
echo "Done. Demo re-armed."
