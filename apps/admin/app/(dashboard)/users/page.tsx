import PageContent from './components/page-content'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string }>
}) {
  const { username } = await searchParams

  return <PageContent username={username} />
}
