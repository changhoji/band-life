import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className='border-black border-2 h-20 flex justify-around items-center'>
      <Link href='/'>BandLife</Link>
      <Link href='/'>navigation</Link>
    </nav>
  );
}
