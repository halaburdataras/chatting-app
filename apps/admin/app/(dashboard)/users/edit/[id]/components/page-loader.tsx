import Container from '@repo/ui/components/container'
import PageHero from '@repo/ui/components/page-hero'
import PageSection from '@repo/ui/components/page-section'
import Skeleton from '@repo/ui/components/skeleton'

export default function PageLoader({ id }: { id: string }) {
  return (
    <Container as="main" className="py-10">
      <PageHero
        title="Edit user"
        description="Edit the user's information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'Edit User', href: `/users/edit/${id}` },
        ]}
      />
      <PageSection
        title="Profile image"
        description="This photo will be displayed in the chat"
        className="mt-10"
      >
        {Array.from({ length: 1 }).map((_, index) => (
          <FormFieldSkeleton key={index} />
        ))}
      </PageSection>

      <PageSection title="User information">
        {Array.from({ length: 3 }).map((_, index) => (
          <FormFieldSkeleton key={index} />
        ))}
      </PageSection>

      <Skeleton className="mt-4 ml-auto h-10 w-48 bg-slate-900" />
    </Container>
  )
}

const FormFieldSkeleton = () => {
  return (
    <div className="grid not-first-of-type:mt-3">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="mt-1 h-14 w-full" />
    </div>
  )
}
