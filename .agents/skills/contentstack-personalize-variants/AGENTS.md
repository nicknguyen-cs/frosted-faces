# Agent Instructions

This repository is an [Agent Skill](https://agentskills.io/). Read [SKILL.md](SKILL.md) for complete documentation on creating, publishing, and delivering Contentstack Personalize entry variants via the CMA/CDA APIs and Next.js middleware.

SKILL.md contains:
- Variant payload format (`_change_set`, `_order`, `_metadata.uid`)
- CMA endpoint for creating/updating entry variants
- Bulk publishing variants
- Fetching variant content via CDA with `x-cs-variant-uid` header
- Delivery SDK `.variants()` usage
- Next.js middleware with Personalize Edge SDK
- Client-side PersonalizeContext for impressions/events
- Common mistakes and troubleshooting
